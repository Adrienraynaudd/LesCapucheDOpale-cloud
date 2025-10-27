import { Module } from '@nestjs/common';
import { SpecialtiesService } from '../services/specialties.service';
import { SpecialtiesController } from '../controllers/specialties.controller';
import { PrismaModule } from '../prisma/prisma.service';

@Module({
    imports: [PrismaModule],
    controllers: [SpecialtiesController],
    providers: [SpecialtiesService],
})
export class SpecialtiesModule {}
