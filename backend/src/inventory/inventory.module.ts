import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryController } from "./inventory.controller"
import { InventoryService } from "./inventory.service"
import { PlayerInventory } from "./entities/player-inventory.entity"
import { Item } from "./entities/item.entity"

@Module({
  imports: [TypeOrmModule.forFeature([PlayerInventory, Item])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}

