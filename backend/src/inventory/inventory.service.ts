import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, DataSource } from "typeorm"
import { PlayerInventory } from "./entities/player-inventory.entity"
import { Item, ItemRarity } from "./entities/item.entity"
import type { AddItemDto } from "./dto/add-item.dto"
import type { UpdateInventoryItemDto } from "./dto/update-item.dto"
import type { PaginationDto } from "./dto/pagination.dto"

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name)
  private readonly MAX_INVENTORY_CAPACITY = 100;

  constructor(
    @InjectRepository(PlayerInventory)
    private playerInventoryRepository: Repository<PlayerInventory>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private dataSource: DataSource,
  ) {}

  async getPlayerInventory(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<{ items: PlayerInventory[]; total: number }> {
    const { page = 0, limit = 10 } = paginationDto

    try {
      const [items, total] = await this.playerInventoryRepository.findAndCount({
        where: { userId },
        relations: ["item"],
        skip: page * limit,
        take: limit,
        order: { updatedAt: "DESC" },
      })

      if (!items.length && page === 0) {
        this.logger.warn(`No inventory items found for user ${userId}`)
      }

      return { items, total }
    } catch (error) {
      this.logger.error(`Failed to fetch inventory for user ${userId}`, error.stack)
      throw error
    }
  }

  async addItemToInventory(addItemDto: AddItemDto): Promise<PlayerInventory> {
    const {
      userId,
      itemId,
      name,
      description,
      type,
      rarity,
      quantity = 1,
      attributes,
      metadata,
      baseValue,
      requiredLevel,
      craftingRequirements,
      usageEffects,
      isSeasonalItem,
      setItems,
    } = addItemDto

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Check inventory capacity
      const inventoryCount = await this.playerInventoryRepository.count({ where: { userId } })
      if (inventoryCount + quantity > this.MAX_INVENTORY_CAPACITY) {
        throw new BadRequestException("Inventory capacity exceeded")
      }

      // If itemId is provided, check if the item exists
      let item: Item

      if (itemId) {
        item = await this.itemRepository.findOne({ where: { id: itemId } })
        if (!item) {
          throw new NotFoundException(`Item with ID ${itemId} not found`)
        }
      } else if (name) {
        // Create a new item if name is provided
        item = this.itemRepository.create({
          name,
          description,
          type,
          rarity,
          attributes,
          baseValue,
          requiredLevel,
          craftingRequirements,
          usageEffects,
          isSeasonalItem,
          setItems,
        })
        await this.itemRepository.save(item)
      } else {
        throw new BadRequestException("Either itemId or item details (name) must be provided")
      }

      // Check if the player already has this item
      const existingInventoryItem = await this.playerInventoryRepository.findOne({
        where: { userId, itemId: item.id },
      })

      let savedInventoryItem: PlayerInventory

      if (existingInventoryItem) {
        // Update quantity if the player already has this item
        existingInventoryItem.quantity += quantity
        existingInventoryItem.updatedAt = new Date()

        if (metadata) {
          existingInventoryItem.metadata = {
            ...existingInventoryItem.metadata,
            ...metadata,
          }
        }

        savedInventoryItem = await this.playerInventoryRepository.save(existingInventoryItem)
      } else {
        // Create a new inventory entry
        const inventoryItem = this.playerInventoryRepository.create({
          userId,
          itemId: item.id,
          quantity,
          metadata,
          durability: item.maxDurability,
        })

        savedInventoryItem = await this.playerInventoryRepository.save(inventoryItem)
      }

      // Commit the transaction
      await queryRunner.commitTransaction()

      this.logger.log(`Added item ${item.id} to user ${userId}'s inventory`)

      return savedInventoryItem
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction()
      this.logger.error(`Failed to add item to inventory for user ${userId}`, error.stack)
      throw error
    } finally {
      // Release the query runner
      await queryRunner.release()
    }
  }

  async updateInventoryItem(userId: string, updateDto: UpdateInventoryItemDto): Promise<PlayerInventory> {
    const { inventoryId, quantity, isEquipped, metadata } = updateDto

    const inventoryItem = await this.playerInventoryRepository.findOne({
      where: { id: inventoryId, userId },
      relations: ["item"],
    })

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item ${inventoryId} not found for user ${userId}`)
    }

    // Handle item removal if quantity is 0
    if (quantity !== undefined) {
      if (quantity === 0) {
        await this.playerInventoryRepository.remove(inventoryItem)
        this.logger.log(`Removed item ${inventoryItem.itemId} from user ${userId}'s inventory`)
        return null
      }
      inventoryItem.quantity = quantity
    }

    if (isEquipped !== undefined) {
      inventoryItem.isEquipped = isEquipped
    }

    if (metadata) {
      inventoryItem.metadata = {
        ...inventoryItem.metadata,
        ...metadata,
      }
    }

    inventoryItem.updatedAt = new Date()

    const updatedItem = await this.playerInventoryRepository.save(inventoryItem)
    this.logger.log(`Updated inventory item ${inventoryId} for user ${userId}`)

    return updatedItem
  }

  async removeItemFromInventory(userId: string, inventoryId: string): Promise<void> {
    const inventoryItem = await this.playerInventoryRepository.findOne({
      where: { id: inventoryId, userId },
    })

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item ${inventoryId} not found for user ${userId}`)
    }

    await this.playerInventoryRepository.remove(inventoryItem)
    this.logger.log(`Removed item ${inventoryItem.itemId} from user ${userId}'s inventory`)
  }

  async repairItem(userId: string, inventoryId: string): Promise<PlayerInventory> {
    const inventoryItem = await this.playerInventoryRepository.findOne({
      where: { id: inventoryId, userId },
      relations: ["item"],
    })

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item ${inventoryId} not found for user ${userId}`)
    }

    const repairCost = this.calculateRepairCost(inventoryItem)
    // Here you would typically check if the user has enough currency to repair the item
    // For simplicity, we'll just perform the repair without checking

    inventoryItem.durability = inventoryItem.item.maxDurability
    inventoryItem.updatedAt = new Date()

    const updatedItem = await this.playerInventoryRepository.save(inventoryItem)
    this.logger.log(`Repaired item ${inventoryId} for user ${userId}`)

    return updatedItem
  }

  async craftItem(userId: string, itemId: string, quantity = 1): Promise<PlayerInventory> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } })

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`)
    }

    if (!item.craftingRequirements) {
      throw new BadRequestException(`Item ${itemId} cannot be crafted`)
    }

    // Check if the user has the required materials
    for (const [requiredItemId, requiredQuantity] of Object.entries(item.craftingRequirements)) {
      const userMaterial = await this.playerInventoryRepository.findOne({
        where: { userId, itemId: requiredItemId },
      })

      if (!userMaterial || userMaterial.quantity < requiredQuantity * quantity) {
        throw new BadRequestException(`Insufficient materials to craft ${item.name}`)
      }
    }

    // Remove crafting materials from inventory
    for (const [requiredItemId, requiredQuantity] of Object.entries(item.craftingRequirements)) {
      await this.updateInventoryItem(userId, {
        inventoryId: requiredItemId,
        quantity: -requiredQuantity * quantity,
      })
    }

    // Add crafted item to inventory
    return this.addItemToInventory({
      userId,
      itemId: item.id,
      quantity,
    })
  }

  async useItem(userId: string, inventoryId: string): Promise<{ message: string; effects: any }> {
    const inventoryItem = await this.playerInventoryRepository.findOne({
      where: { id: inventoryId, userId },
      relations: ["item"],
    })

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item ${inventoryId} not found for user ${userId}`)
    }

    if (inventoryItem.quantity < 1) {
      throw new BadRequestException(`No ${inventoryItem.item.name} remaining in inventory`)
    }

    if (!inventoryItem.item.usageEffects) {
      throw new BadRequestException(`Item ${inventoryItem.item.name} cannot be used`)
    }

    // Apply usage effects (this would typically interact with other game systems)
    const effects = inventoryItem.item.usageEffects

    // Reduce quantity by 1
    inventoryItem.quantity -= 1
    if (inventoryItem.quantity === 0) {
      await this.playerInventoryRepository.remove(inventoryItem)
    } else {
      await this.playerInventoryRepository.save(inventoryItem)
    }

    this.logger.log(`User ${userId} used item ${inventoryId}`)

    return {
      message: `Successfully used ${inventoryItem.item.name}`,
      effects,
    }
  }

  private calculateRepairCost(inventoryItem: PlayerInventory): number {
    const damageTaken = inventoryItem.item.maxDurability - inventoryItem.durability
    const baseRepairCost = inventoryItem.item.baseValue * 0.1 // 10% of base value
    return Math.ceil(baseRepairCost * (damageTaken / inventoryItem.item.maxDurability))
  }

  private calculateItemValue(item: Item): number {
    const rarityMultiplier = {
      [ItemRarity.COMMON]: 1,
      [ItemRarity.UNCOMMON]: 2,
      [ItemRarity.RARE]: 5,
      [ItemRarity.EPIC]: 10,
      [ItemRarity.LEGENDARY]: 20,
    }

    return item.baseValue * rarityMultiplier[item.rarity]
  }
}

