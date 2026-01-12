import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiBody({
    description: 'Credentials',
    required: true,
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', example: 'P@ssw0rd!' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiOkResponse({
    description: 'JWT access token and username',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx.yyy',
        },
        username: {
          type: 'string',
          example: 'John Doe',
        },
      },
    },
  })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('verify')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Token is valid, returns roleId',
    schema: {
      type: 'object',
      properties: {
        roleId: {
          type: 'number',
          example: 1,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token is invalid or missing',
  })
  async verifyToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7);
    return this.authService.verifyToken(token);
  }
}
