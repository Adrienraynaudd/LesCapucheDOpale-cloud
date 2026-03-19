import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { GithubOAuthUser } from '../services/auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);
  private readonly configured: boolean;

  constructor() {
    const clientID = process.env.OAUTH_GITHUB_CLIENT_ID ?? '';
    const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET ?? '';
    const callbackURL =
      process.env.GITHUB_CALLBACK_URL ??
      'http://localhost/api/auth/github/callback';

    const configured = Boolean(clientID && clientSecret);

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });

    this.configured = configured;

    if (!clientID || !clientSecret) {
      this.logger.warn(
        'OAUTH_GITHUB_CLIENT_ID or OAUTH_GITHUB_CLIENT_SECRET is missing. GitHub OAuth endpoints will fail until configured.',
      );
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GithubOAuthUser {
    const fallbackEmail = profile.username
      ? `${profile.username}@users.noreply.github.com`
      : `github-${profile.id}@users.noreply.github.com`;

    return {
      email: (profile.emails?.[0]?.value ?? fallbackEmail).toLowerCase(),
      name: profile.displayName || profile.username || 'GitHub user',
      githubId: profile.id,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
