import { Module } from '@nestjs/common';
import { ConsumablesService } from '../services/consumables.service';
import { ConsumablesController } from '../controllers/consumables.controller';
import { PrismaModule } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConsumablesController],
  providers: [ConsumablesService],
})
export class ConsumablesModule {}
