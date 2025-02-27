import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common"
import type { InventoryService } from "./inventory.service"
import { AddItemDto } from "./dto/add-item.dto"
import { UpdateInventoryItemDto } from "./dto/update-item.dto"
import type { PlayerInventory } from "./entities/player-inventory.entity"
import { PaginationDto } from "./dto/pagination.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from "@nestjs/swagger"

@ApiTags("inventory")
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(":userId")
  @ApiOperation({ summary: "Get a player's inventory" })
  @ApiParam({ name: "userId", description: "The ID of the user" })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: "Returns the player's inventory items with pagination",
  })
  @ApiResponse({ status: 404, description: "User inventory not found" })
  async getPlayerInventory(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<{ items: PlayerInventory[]; total: number }> {
    return this.inventoryService.getPlayerInventory(userId, paginationDto)
  }

  @Post('add')
  @ApiOperation({ summary: 'Add an item to player\'s inventory' })
  @ApiBody({ type: AddItemDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The item has been successfully added to inventory',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async addItemToInventory(@Body() addItemDto: AddItemDto): Promise<PlayerInventory> {
    return this.inventoryService.addItemToInventory(addItemDto);
  }

  @Patch(":userId/update")
  @ApiOperation({ summary: "Update an item in player's inventory" })
  @ApiParam({ name: "userId", description: "The ID of the user" })
  @ApiBody({ type: UpdateInventoryItemDto })
  @ApiResponse({
    status: 200,
    description: "The inventory item has been successfully updated",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "Inventory item not found" })
  async updateInventoryItem(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateInventoryItemDto,
  ): Promise<PlayerInventory> {
    return this.inventoryService.updateInventoryItem(userId, updateDto)
  }

  @Delete(":userId/item/:inventoryId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove an item from player's inventory" })
  @ApiParam({ name: "userId", description: "The ID of the user" })
  @ApiParam({ name: "inventoryId", description: "The ID of the inventory entry" })
  @ApiResponse({ status: 204, description: "The inventory item has been successfully removed" })
  @ApiResponse({ status: 404, description: "Inventory item not found" })
  async removeItemFromInventory(
    @Param('userId') userId: string,
    @Param('inventoryId') inventoryId: string,
  ): Promise<void> {
    return this.inventoryService.removeItemFromInventory(userId, inventoryId)
  }
}

