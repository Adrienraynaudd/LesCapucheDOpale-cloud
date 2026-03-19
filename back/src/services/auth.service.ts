import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

interface AuthUserPayload {
  id: number;
  email: string;
  roleId: number;
}

export interface GithubOAuthUser {
  email: string;
  name: string;
  githubId?: string;
  avatarUrl?: string;
}

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

    const token = await this.signAccessToken(user);

    return { access_token: token, username: user.name };
  }

  async loginWithGithubProfile(profile: GithubOAuthUser) {
    const normalizedEmail = profile.email.trim().toLowerCase();
    let user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      user = await this.usersService.createOAuthUser({
        name: profile.name,
        email: normalizedEmail,
        roleId: 2,
      });
    }

    const token = await this.signAccessToken(user);
    return { access_token: token, username: user.name };
  }

  async verifyToken(token: string) {
    try {
      let payload: { roleId: number };
      try {
        payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
      } catch {
        payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET_ADMIN,
        });
      }

      return { roleId: payload.roleId };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async signAccessToken(user: AuthUserPayload) {
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    if (user.roleId === 1) {
      return this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_ADMIN,
        expiresIn: '4h',
      });
    }

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
  }
}
