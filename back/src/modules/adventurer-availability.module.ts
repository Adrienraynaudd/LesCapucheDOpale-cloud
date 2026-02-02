import { Module } from '@nestjs/common';
import { AdventurerAvailabilityController } from '../controllers/adventurer-availability.controller';
import { AdventurerAvailabilityService } from '../services/adventurer-availability.service';
import { PrismaModule } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdventurerAvailabilityController],
  providers: [AdventurerAvailabilityService],
  exports: [AdventurerAvailabilityService],
})
export class AdventurerAvailabilityModule {}
