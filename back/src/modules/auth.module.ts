import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { UsersModule } from './users.module';
import { GithubStrategy } from '../strategies/github.strategy';

@Global()
@Module({
  imports: [UsersModule, JwtModule.register({}), PassportModule.register({ session: false })],
  providers: [AuthService, GithubStrategy],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
