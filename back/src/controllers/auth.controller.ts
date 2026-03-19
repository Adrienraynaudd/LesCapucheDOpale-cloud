import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Headers,
  UnauthorizedException,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService, GithubOAuthUser } from '../services/auth.service';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { GithubAuthGuard } from '../guards/github-auth.guard';
import { Request, Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiExcludeEndpoint()
  githubLogin() {
    // Passport guard redirects to GitHub.
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiExcludeEndpoint()
  async githubCallback(
    @Req() req: Request & { user?: GithubOAuthUser },
    @Res() res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('GitHub authentication failed');
    }

    const authResult = await this.authService.loginWithGithubProfile(req.user);
    const frontendSuccessUrl =
      process.env.FRONTEND_OAUTH_SUCCESS_URL?.trim() ||
      `${this.getPublicBaseUrl(req)}/auth/callback`;

    const separator = frontendSuccessUrl.includes('?') ? '&' : '?';
    const redirectUrl = `${frontendSuccessUrl}${separator}access_token=${encodeURIComponent(authResult.access_token)}&username=${encodeURIComponent(authResult.username)}`;
    return res.redirect(redirectUrl);

  }

  private getPublicBaseUrl(req: Request): string {
    const forwardedProtoHeader = req.headers['x-forwarded-proto'];
    const forwardedProto = Array.isArray(forwardedProtoHeader)
      ? forwardedProtoHeader[0]
      : forwardedProtoHeader;

    const protocol =
      forwardedProto?.split(',')[0]?.trim() || req.protocol || 'http';
    const host = req.get('host') || 'localhost';

    return `${protocol}://${host}`;
  }

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
