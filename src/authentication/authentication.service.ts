import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { LdapService } from '../ldap/ldap.service';
import { SignInDto } from './dto/signin.dto';
import { UserPayloadProps } from '../common/types';
import { UsersRepository } from '../modules/users/users.repository';
import signToken from '../common/functions/sign-token.function';
import { JwtService } from '@nestjs/jwt';
import { AuthUserProps, Tokens } from './types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly ldapService: LdapService,
		private readonly usersRepository: UsersRepository,
		private readonly jwtService: JwtService,
	) {}

	async signIn(signInDto: SignInDto) {
		const userExists = await this.usersRepository.findByUsername(
			signInDto.username,
		);

		if (!userExists)
			throw new NotFoundException({
				message: 'Usuário  não encontrado no TMDB!',
			});

		if (!userExists.status)
			throw new ForbiddenException({
				message: 'Usuário desativado no TMDB',
			});

		if (signInDto.connect_ldap) {
			await this.ldapService.authenticate({
				username: signInDto.username,
				password: signInDto.password,
			});
		} else {
			if (!userExists?.password)
				throw new BadRequestException({
					message:
						'Usuário não possui senha, por favor entre em contato com o admistrador do sistema!',
				});

			const passwordMatch = await bcrypt.compare(
				signInDto.password,
				userExists?.password,
			);

			if (!passwordMatch)
				throw new BadRequestException({
					message: 'Credenciais inválidas!',
				});
		}

		const operations = userExists.profiles?.profile_operation?.map(
			(op) => op.operations.identifier,
		);

		const tokens = await this.getTokens({
			id: userExists?.id,
			email: userExists?.email,
			username: userExists?.username,
			name: userExists?.name,
			status: userExists?.status,
			profile_id: userExists?.profile_id,
			profile_identifier: userExists?.profiles?.identifier,
			operations: operations,
		});

		const payloadUser = {
			...userExists,
			profile_description: userExists?.profiles?.description,
		};

		delete payloadUser.password;
		delete payloadUser.profiles;

		return { ...payloadUser, ...tokens };
	}

	async whoami(currentUser: UserPayloadProps, token: string) {
		const userLogged = await this.usersRepository.findByUsername(
			currentUser.username,
		);

		if (!userLogged)
			throw new NotFoundException({ message: 'Usuário  não encontrado' });

		const payloadUser = {
			...userLogged,
			profile_description: userLogged?.profiles?.description,
			operations: userLogged.profiles?.profile_operation?.map(
				(op) => op.operations.identifier,
			),
		};

		delete payloadUser.password;
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
}
