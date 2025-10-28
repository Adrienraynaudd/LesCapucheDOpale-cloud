import { Module } from '@nestjs/common';
import { EquipmentStocksController } from '../controllers/equipment-stocks.controller';
import { EquipmentStocksService } from '../services/equipment-stocks.service';
import { PrismaModule } from '../prisma/prisma.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EquipmentStocksController],
  providers: [EquipmentStocksService],
})
export class EquipmentStocksModule {}
