import { Module } from '@nestjs/common';
import { ConsumableTypesService } from '../services/consumable-types.service';
import { ConsumableTypesController } from '../controllers/consumable-types.controller';
import { PrismaModule } from '../prisma/prisma.service';

@Module({
    imports: [PrismaModule],
    controllers: [ConsumableTypesController],
    providers: [ConsumableTypesService],
})
export class ConsumableTypesModule {}
