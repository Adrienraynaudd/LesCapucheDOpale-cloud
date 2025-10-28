import { Module } from '@nestjs/common';
import { QuestStockEquipmentController } from '../controllers/quest-stock-equipment.controller';
import { QuestStockEquipmentService } from '../services/quest-stock-equipment.service';
import { PrismaModule } from '../prisma/prisma.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QuestStockEquipmentController],
  providers: [QuestStockEquipmentService],
})
export class QuestStockEquipmentModule {}
