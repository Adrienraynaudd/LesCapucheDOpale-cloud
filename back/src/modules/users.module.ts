import { Module } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from '../controllers/users.controller';
import { PrismaModule } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, JwtAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
