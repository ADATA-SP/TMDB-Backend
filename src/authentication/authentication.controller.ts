import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import {
	ApiBadGatewayResponse,
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
import { SsoSignInDto } from './dto/sso-sign-in.dto';
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

	@Post('sso')
	@Public()
	@Throttle({ short: { ttl: 60000, limit: 20 } })
	@ApiOperation({
		summary: 'Autentica o usuário a partir do SSO do Portal ADATA',
		description:
			'Recebe o código de uso único entregue pelo Portal à bridge do front, troca-o no Portal pelos dados do usuário e emite os tokens do TMDB. O usuário é criado ou atualizado a cada acesso, e o perfil vem do primeiro alias enviado pelo Portal que corresponda a um perfil ativo do TMDB. Rota pública, limitada a 20 tentativas por minuto.',
	})
	@ApiOkResponse({
		description:
			'Autenticação concluída. O token carrega as operações do perfil do usuário, utilizadas pelo controle de permissões.',
		schema: {
			example: {
				id: 1,
				name: 'SP Engineer',
				username: null,
				email: 'sp.engineer@adata.com',
				status: 1,
				path_image: null,
				created_at: '2026-09-29T12:00:00.000Z',
				updated_at: '2026-09-29T12:00:00.000Z',
				portal_user_id: '1001',
				profile_id: 1,
				profile_description: 'Administrador',
				token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Corpo da requisição inválido.',
		schema: {
			example: {
				message: 'Campo sso_code não pode estar vazio',
			},
		},
	})
	@ApiUnauthorizedResponse({
		description:
			'Código SSO inválido, expirado, já utilizado, emitido para outro sistema ou com state/client_nonce divergentes.',
		schema: {
			example: {
				message:
					'Não foi possível validar o acesso pelo Portal ADATA. Abra o TMDB novamente pelo Portal.',
			},
		},
	})
	@ApiForbiddenResponse({
		description:
			'Nenhum dos perfis enviados pelo Portal corresponde a um perfil ativo do TMDB.',
		schema: {
			example: {
				message:
					'Seu perfil no Portal ADATA não dá acesso ao TMDB. Entre em contato com o administrador.',
			},
		},
	})
	@ApiBadGatewayResponse({
		description: 'O Portal ADATA não respondeu ou retornou erro interno.',
		schema: {
			example: {
				message:
					'O Portal ADATA está indisponível no momento. Tente novamente em instantes.',
			},
		},
	})
	@ApiTooManyRequestsResponse({
		description: 'Limite de 20 tentativas por minuto excedido.',
		schema: {
			example: {
				statusCode: 429,
				message: 'ThrottlerException: Too Many Requests',
			},
		},
	})
	ssoSignIn(@Body() ssoSignInDto: SsoSignInDto) {
		return this.authenticationService.ssoSignIn(ssoSignInDto);
	}

	@Post('whoami')
	@ApiOperation({
		summary: 'Retorna os dados do usuário autenticado',
		description:
			'Recupera o cadastro do usuário associado ao token informado no cabeçalho Authorization, devolvendo o mesmo token na resposta.',
	})
	@ApiOkResponse({
		description: 'Dados do usuário autenticado e suas operações liberadas.',
		schema: {
			example: {
				id: 1,
				name: 'SP Engineer',
				username: null,
				email: 'sp.engineer@adata.com',
				status: 1,
				path_image: null,
				created_at: '2026-09-29T12:00:00.000Z',
				updated_at: '2026-09-29T12:00:00.000Z',
				portal_user_id: '1001',
				profile_id: 1,
				profile_description: 'Administrador',
				operations: [
					'show-machines',
					'edit-machines',
					'edit-permissions',
					'show-permissions',
				],
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
