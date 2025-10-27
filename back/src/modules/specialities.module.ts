import { Module } from '@nestjs/common';
import { SpecialitiesService } from '../services/specialities.service';
import { SpecialitiesController } from '../controllers/specialities.controller';
import { PrismaModule } from '../prisma/prisma.service';

@Module({
    imports: [PrismaModule],
    controllers: [SpecialitiesController],
    providers: [SpecialitiesService],
})
export class SpecialitiesModule {}
