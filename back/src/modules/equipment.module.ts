import { Module } from '@nestjs/common';
import { EquipmentController } from '../controllers/equipment.controller';
import { EquipmentService } from '../services/equipment.service';
import { PrismaModule } from '../prisma/prisma.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EquipmentController],
  providers: [EquipmentService],
})
export class EquipmentModule {}
