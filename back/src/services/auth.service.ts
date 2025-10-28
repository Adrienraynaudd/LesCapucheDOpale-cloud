import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateUserByEmailPassword(
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    let token: string;
    if (user.roleId === 1) {
      // Admin
      token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_ADMIN,
        expiresIn: '4h',
      });
    } else {
      token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });
    }

    return { access_token: token };
  }
}
