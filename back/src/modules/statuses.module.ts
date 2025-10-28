import { Module } from '@nestjs/common';
import { StatusesController } from '../controllers/statuses.controller';
import { StatusesService } from '../services/statuses.service';
import { PrismaModule } from '../prisma/prisma.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StatusesController],
  providers: [StatusesService],
  exports: [StatusesService],
})
export class StatusesModule {}
