import {
	ExecutionContext,
	Injectable,
	ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GithubStrategy } from '../strategies/github.strategy';
import { Request } from 'express';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
	constructor(private readonly githubStrategy: GithubStrategy) {
		super();
	}

	canActivate(context: ExecutionContext) {
		if (!this.githubStrategy.isConfigured()) {
			throw new ServiceUnavailableException(
				'GitHub OAuth is not configured. Set OAUTH_GITHUB_CLIENT_ID and OAUTH_GITHUB_CLIENT_SECRET.',
			);
		}

		return super.canActivate(context);
	}

	getAuthenticateOptions(context: ExecutionContext) {
		const configuredCallbackUrl = process.env.GITHUB_CALLBACK_URL?.trim();
		if (configuredCallbackUrl) {
			return { callbackURL: configuredCallbackUrl };
		}

		const req = context.switchToHttp().getRequest<Request>();
		const host = this.getPublicHost(req);
		const forwardedProtoHeader = req.headers['x-forwarded-proto'];
		const forwardedProto = Array.isArray(forwardedProtoHeader)
			? forwardedProtoHeader[0]
			: forwardedProtoHeader;
		const protocol = forwardedProto?.split(',')[0]?.trim() || req.protocol || 'http';

		if (!host) {
			return {};
		}

		return {
			callbackURL: `${protocol}://${host}/api/auth/github/callback`,
		};
	}

	private getPublicHost(req: Request): string | undefined {
		const forwardedHostHeader = req.headers['x-forwarded-host'];
		const forwardedHost = Array.isArray(forwardedHostHeader)
			? forwardedHostHeader[0]
			: forwardedHostHeader;

		return forwardedHost?.split(',')[0]?.trim() || req.get('host') || undefined;
	}
}
