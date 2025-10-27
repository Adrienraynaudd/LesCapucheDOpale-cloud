import { Module } from '@nestjs/common';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { EquipmentTypesController } from '../controllers/equipment-types.controller';
import { PrismaModule } from '../prisma/prisma.service';

@Module({
    imports: [PrismaModule],
    controllers: [EquipmentTypesController],
    providers: [EquipmentTypesService],
})
export class EquipmentTypesModule {}
