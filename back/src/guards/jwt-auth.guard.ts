import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtUser {
  sub: number;
  email: string;
  roleId: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtUser }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payloadAdmin = this.jwtService.verify<JwtUser>(token, {
        secret: process.env.JWT_SECRET_ADMIN,
      });
      request.user = payloadAdmin;
      return true;
    } catch (errAdmin: unknown) {
      if (errAdmin instanceof Error) {
        console.log(
          '[JwtAuthGuard] Not admin token, trying user...',
          errAdmin.message,
        );
      }

      try {
        const payloadUser = this.jwtService.verify<JwtUser>(token, {
          secret: process.env.JWT_SECRET,
        });
        request.user = payloadUser;
        return true;
      } catch (errUser: unknown) {
        if (errUser instanceof Error) {
          console.log(
            '[JwtAuthGuard] Invalid token for both:',
            errUser.message,
          );
        }
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
}
