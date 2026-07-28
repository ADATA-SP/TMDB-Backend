import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { AuthToken, GetCurrentUser, Public } from '../common/decorators';
import { UserPayloadProps } from '../common/types';
import { Throttle } from '@nestjs/throttler';

@Controller('authentication')
@ApiTags('Authentication')
@ApiBearerAuth('JWT-auth')
export class AuthenticationController {
	constructor(
		private readonly authenticationService: AuthenticationService,
	) {}

	@Post('sign-in')
	@Public()
	@Throttle({ short: { ttl: 60000, limit: 5 } })
	@ApiOperation({
		summary: 'Autentica o usuário e emite os tokens de acesso',
		description:
			'Valida as credenciais informadas e retorna os dados do usuário acompanhados do token de acesso e do token de renovação. A senha é verificada no LDAP quando connect_ldap for true, ou na base local quando false. Rota pública, limitada a 5 tentativas por minuto.',
	})
	@ApiOkResponse({
		description: 'Autenticação concluída.',
		schema: {
			example: {
				id: 1,
				name: 'Administrador',
				username: 'admin',
				email: 'admin@email.com',
				status: 1,
				path_image: null,
				created_at: '2026-07-28T16:30:00.000Z',
				updated_at: '2026-07-28T16:30:00.000Z',
				ldap_crendential: 0,
				profile_id: 1,
				token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'Credenciais inválidas ou usuário sem senha cadastrada na base local.',
		schema: {
			example: {
				message: 'Credenciais inválidas!',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: 'Falha na validação das credenciais junto ao LDAP.',
		schema: {
			example: {
				statusCode: 401,
				message: 'Credenciais inválidas por favor verifique',
				error: 'Unauthorized',
			},
		},
	})
	@ApiForbiddenResponse({
		description: 'Usuário desativado no TMDB.',
		schema: {
			example: {
				message: 'Usuário desativado no TMDB',
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Usuário não cadastrado no TMDB.',
		schema: {
			example: {
				message: 'Usuário  não encontrado no TMDB!',
			},
		},
	})
	@ApiTooManyRequestsResponse({
		description: 'Limite de 5 tentativas por minuto excedido.',
		schema: {
			example: {
				statusCode: 429,
				message: 'ThrottlerException: Too Many Requests',
			},
		},
	})
	signIn(@Body() signDto: SignInDto) {
		return this.authenticationService.signIn(signDto);
	}

	@Post('whoami')
	@ApiOperation({
		summary: 'Retorna os dados do usuário autenticado',
		description:
			'Recupera o cadastro do usuário associado ao token informado no cabeçalho Authorization, devolvendo o mesmo token na resposta.',
	})
	@ApiOkResponse({
		description: 'Dados do usuário autenticado.',
		schema: {
			example: {
				id: 1,
				name: 'Administrador',
				username: 'admin',
				email: 'admin@email.com',
				status: 1,
				path_image: null,
				created_at: '2026-07-28T16:30:00.000Z',
				updated_at: '2026-07-28T16:30:00.000Z',
				ldap_crendential: 0,
				profile_id: 1,
				token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: 'Token ausente, inválido ou expirado.',
		schema: {
			example: {
				statusCode: 401,
				message: 'Unauthorized',
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Usuário do token não localizado na base.',
		schema: {
			example: {
				message: 'Usuário  não encontrado',
			},
		},
	})
	whoami(
		@GetCurrentUser() currentUser: UserPayloadProps,
		@AuthToken() authToken: string,
	) {
		return this.authenticationService.whoami(currentUser, authToken);
	}
}
