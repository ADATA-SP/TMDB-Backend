import { Request } from 'express';
import {
	BadGatewayException,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { SsoSignInDto } from './dto/sso-sign-in.dto';
import { PortalUser } from './types';

const INVALID_ACCESS_MESSAGE =
	'Não foi possível validar o acesso pelo Portal ADATA. Abra o TMDB novamente pelo Portal.';

@Injectable()
export class PortalSsoService {
	private readonly logger = new Logger(PortalSsoService.name);

	private getPublicOrigin(request: Request): string {
		const protocol =
			request.get('x-forwarded-proto')?.split(',')[0].trim() ??
			request.protocol;

		const host =
			request.get('x-forwarded-host')?.split(',')[0].trim() ??
			request.get('host');

		return `${protocol}://${host}`;
	}

	async exchangeCode(ssoSignInDto: SsoSignInDto, request: Request): Promise<PortalUser> {
		const origin = this.getPublicOrigin(request);
		const exchangeUrl = `${process.env.SSO_PORTAL_API_URL.replace(/\/+$/, '')}/systems/sso/exchange`;

		try {
			const response = await axios.post(
				exchangeUrl,
				{
					code: ssoSignInDto.sso_code,
					system_id: ssoSignInDto.system_id,
					origin,
					state: ssoSignInDto.state,
					client_nonce: ssoSignInDto.client_nonce,
				},
				{
					headers: { 'x-api-key': process.env.SSO_API_KEY },
					timeout: 8000,
				},
			);

			return this.parsePortalUser(response.data?.user);
		} catch (error) {
			if (!axios.isAxiosError(error)) throw error;

			const status = error.response?.status;

			this.logger.warn(
				`Troca do código SSO falhou (${status ?? error.code}): ${JSON.stringify(error.response?.data ?? error.message)}`,
			);

			if (status && status < 500)
				throw new UnauthorizedException({
					message: INVALID_ACCESS_MESSAGE,
				});

			throw new BadGatewayException({
				message:
					'O Portal ADATA está indisponível no momento. Tente novamente em instantes.',
			});
		}
	}

	private parsePortalUser(user: unknown): PortalUser {
		const data = (user ?? {}) as Record<string, unknown>;
		const id =
			typeof data.id === 'number' ? String(data.id) : this.text(data.id);
		const email = this.text(data.email);
		const firstName = this.text(data.first_name);
		const lastName =
			typeof data.last_name === 'string' ? data.last_name : '';
		const profiles = data.profiles;

		if (
			!id ||
			!email ||
			!firstName ||
			!Array.isArray(profiles) ||
			profiles.some((profile) => typeof profile !== 'string')
		) {
			this.logger.warn(
				`Portal devolveu um usuário inválido: ${JSON.stringify(user)}`,
			);
			throw new UnauthorizedException({
				message: INVALID_ACCESS_MESSAGE,
			});
		}

		return {
			id,
			email: email.toLowerCase(),
			name: `${firstName} ${lastName.trim()}`.trim(),
			profiles: profiles as string[],
		};
	}

	private text(value: unknown) {
		return typeof value === 'string' && value.trim() ? value.trim() : null;
	}
}
