import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UserPayloadProps } from '../common/types';
import signToken from '../common/functions/sign-token.function';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AuthUserProps, PortalUser, Tokens } from './types';
import { PrismaService } from '../database/prisma.service';
import { PortalSsoService } from './portal-sso.service';
import { SsoSignInDto } from './dto/sso-sign-in.dto';

const userWithOperations = {
	profiles: {
		include: {
			profile_operation: { include: { operations: true } },
		},
	},
} satisfies Prisma.usersInclude;

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly portalSsoService: PortalSsoService,
		private readonly jwtService: JwtService,
	) {}

	async ssoSignIn(ssoSignInDto: SsoSignInDto) {
		const portalUser =
			await this.portalSsoService.exchangeCode(ssoSignInDto);

		const profile = await this.findProfileFromPortal(portalUser.profiles);

		if (!profile)
			throw new ForbiddenException({
				message:
					'Seu perfil no Portal ADATA não dá acesso ao TMDB. Entre em contato com o administrador.',
			});

		const user = await this.syncPortalUser(portalUser, profile.id);

		const tokens = await this.getTokens({
			id: user.id,
			email: user.email,
			username: user.username,
			name: user.name,
			status: user.status,
			profile_id: user.profile_id,
			profile_identifier: user.profiles?.identifier,
			operations: user.profiles?.profile_operation?.map(
				(op) => op.operations.identifier,
			),
		});

		const payloadUser = {
			...user,
			profile_description: user.profiles?.description,
		};

		delete payloadUser.profiles;

		return { ...payloadUser, ...tokens };
	}

	async whoami(currentUser: UserPayloadProps, token: string) {
		const userLogged = await this.prismaService.users.findUnique({
			where: { id: Number(currentUser.sub) },
			include: userWithOperations,
		});

		if (!userLogged)
			throw new NotFoundException({ message: 'Usuário  não encontrado' });

		const payloadUser = {
			...userLogged,
			profile_description: userLogged?.profiles?.description,
			operations: userLogged.profiles?.profile_operation?.map(
				(op) => op.operations.identifier,
			),
		};

		delete payloadUser.profiles;

		return {
			...payloadUser,
			token,
		};
	}

	async getTokens(user: AuthUserProps): Promise<Tokens> {
		const [at, rt] = await Promise.all([
			signToken(
				user,
				process.env.JWT_AT_EXPIRES,
				process.env.JWT_AT_SECRET,
				this.jwtService,
			),
			signToken(
				user,
				process.env.JWT_RT_EXPIRES,
				process.env.JWT_RT_SECRET,
				this.jwtService,
			),
		]);

		return {
			token: at,
			refreshToken: rt,
		};
	}

	private async findProfileFromPortal(aliases: string[]) {
		if (!aliases.length) return null;

		const profiles = await this.prismaService.profiles.findMany({
			where: { identifier: { in: aliases }, status: 1 },
		});

		for (const alias of aliases) {
			const profile = profiles.find(
				(item) => item.identifier.toLowerCase() === alias.toLowerCase(),
			);

			if (profile) return profile;
		}

		return null;
	}

	private async syncPortalUser(portalUser: PortalUser, profileId: number) {
		const data = {
			name: portalUser.name,
			email: portalUser.email,
			portal_user_id: portalUser.id,
			profile_id: profileId,
			updated_at: new Date(),
		};

		const existingUser =
			(await this.prismaService.users.findFirst({
				where: { portal_user_id: portalUser.id },
			})) ??
			(await this.prismaService.users.findFirst({
				where: { email: portalUser.email },
			}));

		if (existingUser)
			return this.prismaService.users.update({
				where: { id: existingUser.id },
				data,
				include: userWithOperations,
			});

		return this.prismaService.users.create({
			data,
			include: userWithOperations,
		});
	}
}
