import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, type Repository } from 'typeorm';
import { InventoryService } from './inventory.service';
import { PlayerInventory } from './entities/player-inventory.entity';
import { Item, ItemType } from './entities/item.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock data
const mockItem = {
  id: '1',
  name: 'Test Item',
  description: 'A test item',
  type: ItemType.POWER_UP,
  attributes: { power: 10 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockInventoryItem = {
  id: '1',
  userId: 'user1',
  itemId: '1',
  item: mockItem,
  quantity: 1,
  isEquipped: false,
  metadata: { source: 'test' },
  acquiredAt: new Date(),
  updatedAt: new Date(),
};

// Mock repositories
const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

// Mock DataSource
const createMockDataSource = () => ({
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  }),
});

describe('InventoryService', () => {
  let service: InventoryService;
  let itemRepository: Repository<Item>;
  let inventoryRepository: Repository<PlayerInventory>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Item),
          useFactory: createMockRepository,
        },
        {
          provide: getRepositoryToken(PlayerInventory),
          useFactory: createMockRepository,
        },
        {
          provide: DataSource,
          useFactory: createMockDataSource,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    itemRepository = module.get<Repository<Item>>(getRepositoryToken(Item));
    inventoryRepository = module.get<Repository<PlayerInventory>>(
      getRepositoryToken(PlayerInventory),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlayerInventory', () => {
    it('should return paginated inventory items', async () => {
      const paginationDto = { page: 0, limit: 10 };
      const mockItems = [mockInventoryItem];
      const mockTotal = 1;

      jest
        .spyOn(inventoryRepository, 'findAndCount')
        .mockResolvedValue('fhfh' as any);

      const result = await service.getPlayerInventory('user1', paginationDto);

      expect(result).toEqual({ items: mockItems, total: mockTotal });
      expect(inventoryRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        relations: ['item'],
        skip: 0,
        take: 10,
        order: { updatedAt: 'DESC' },
      });
    });
  });

  describe('addItemToInventory', () => {
    it('should add an existing item to inventory', async () => {
      const addItemDto = {
        userId: 'user1',
        itemId: '1',
        quantity: 1,
      };

      jest.spyOn(itemRepository, 'findOne').mockResolvedValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(inventoryRepository, 'create').mockReturnValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'save').mockResolvedValue('fhfh' as any);

      const result = await service.addItemToInventory(addItemDto);

      expect(result).toEqual(mockInventoryItem);
      expect(itemRepository.findOne).toHaveBeenCalled();
      expect(inventoryRepository.findOne).toHaveBeenCalled();
      expect(inventoryRepository.create).toHaveBeenCalled();
      expect(inventoryRepository.save).toHaveBeenCalled();
    });

    it('should create a new item and add to inventory', async () => {
      const addItemDto = {
        userId: 'user1',
        name: 'New Item',
        description: 'A new item',
        type: ItemType.POWER_UP,
        attributes: { power: 10 },
      };

      jest.spyOn(itemRepository, 'create').mockReturnValue('fhfh' as any);
      jest.spyOn(itemRepository, 'save').mockResolvedValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(inventoryRepository, 'create').mockReturnValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'save').mockResolvedValue('fhfh' as any);

      const result = await service.addItemToInventory(addItemDto);

      expect(result).toEqual(mockInventoryItem);
      expect(itemRepository.create).toHaveBeenCalled();
      expect(itemRepository.save).toHaveBeenCalled();
      expect(inventoryRepository.findOne).toHaveBeenCalled();
      expect(inventoryRepository.create).toHaveBeenCalled();
      expect(inventoryRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if neither itemId nor name is provided', async () => {
      const addItemDto = {
        userId: 'user1',
      };

      await expect(service.addItemToInventory(addItemDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if item with provided ID does not exist', async () => {
      const addItemDto = {
        userId: 'user1',
        itemId: 'non-existent',
      };

      jest.spyOn(itemRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addItemToInventory(addItemDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update quantity if item already exists in inventory', async () => {
      const addItemDto = {
        userId: 'user1',
        itemId: '1',
        quantity: 2,
      };

      const existingItem = { ...mockInventoryItem, quantity: 1 };
      const updatedItem = { ...mockInventoryItem, quantity: 3 };

      jest.spyOn(itemRepository, 'findOne').mockResolvedValue('fhfh' as any);
      jest
        .spyOn(inventoryRepository, 'findOne')
        .mockResolvedValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'save').mockResolvedValue('fhfh' as any);

      const result = await service.addItemToInventory(addItemDto);

      expect(result).toEqual(updatedItem);
      expect(inventoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 }),
      );
    });
  });

  describe('updateInventoryItem', () => {
    it('should update an inventory item', async () => {
      const updateDto = {
        inventoryId: '1',
        quantity: 5,
        isEquipped: true,
      };

      const existingItem = { ...mockInventoryItem };
      const updatedItem = {
        ...mockInventoryItem,
        quantity: 5,
        isEquipped: true,
      };

      jest
        .spyOn(inventoryRepository, 'findOne')
        .mockResolvedValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'save').mockResolvedValue('fhfh' as any);

      const result = await service.updateInventoryItem('user1', updateDto);

      expect(result).toEqual(updatedItem);
      expect(inventoryRepository.findOne).toHaveBeenCalled();
      expect(inventoryRepository.save).toHaveBeenCalled();
    });

    it('should remove item if quantity is set to 0', async () => {
      const updateDto = {
        inventoryId: '1',
        quantity: 0,
      };

      const existingItem = { ...mockInventoryItem };

      jest
        .spyOn(inventoryRepository, 'findOne')
        .mockResolvedValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'remove').mockResolvedValue(undefined);

      const result = await service.updateInventoryItem('user1', updateDto);

      expect(result).toBeNull();
      expect(inventoryRepository.findOne).toHaveBeenCalled();
      expect(inventoryRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if inventory item does not exist', async () => {
      const updateDto = {
        inventoryId: 'non-existent',
        quantity: 5,
      };

      jest.spyOn(inventoryRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateInventoryItem('user1', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItemFromInventory', () => {
    it('should remove an inventory item', async () => {
      const existingItem = { ...mockInventoryItem };

      jest
        .spyOn(inventoryRepository, 'findOne')
        .mockResolvedValue('fhfh' as any);
      jest.spyOn(inventoryRepository, 'remove').mockResolvedValue(undefined);

      await service.removeItemFromInventory('user1', '1');

      expect(inventoryRepository.findOne).toHaveBeenCalled();
      expect(inventoryRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if inventory item does not exist', async () => {
      jest.spyOn(inventoryRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.removeItemFromInventory('user1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
