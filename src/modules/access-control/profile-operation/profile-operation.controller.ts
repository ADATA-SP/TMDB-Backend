import {
	Body,
	Controller,
	Get,
	ParseArrayPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { ProfileOperationService } from './profile-operation.service';
import { CreateProfileOperationDto } from './dto/create-profile-operation.dto';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import { ApiAuthResponses } from '../../../common/decorators';
import { MessageResponseDto } from '../../../common/dto/message-response.dto';

@Controller('profile-operation')
@ApiTags('Profile Operation')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class ProfileOperationController {
	constructor(
		private readonly profileOperationService: ProfileOperationService,
	) {}

	@Get()
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.READ))
	@ApiOperation({
		summary: 'Lista as permissões por perfil',
		description:
			'Retorna os perfis ativos com as operações liberadas para cada um. É o estado atual da matriz de permissões.',
	})
	@ApiOkResponse({
		description: 'Perfis ativos com suas operações.',
		schema: {
			example: [
				{
					id: 1,
					description: 'Administrador',
					identifier: 'admin',
					external: 1,
					status: 1,
					created_at: '2026-09-15T13:00:00.000Z',
					updated_at: '2026-09-15T13:00:00.000Z',
					profile_operation: [
						{
							operations: {
								id: 1,
								description: 'Criar Usuários',
								identifier: 'create-users',
								module_id: 1,
							},
						},
					],
				},
			],
		},
	})
	findAll() {
		return this.profileOperationService.findAll();
	}

	@Post()
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.UPDATE))
	@ApiOperation({
		summary: 'Define as permissões dos perfis',
		description:
			'Substitui integralmente as operações de cada perfil informado. Perfis não encontrados pelo identificador são ignorados, assim como operações inexistentes. A alteração só passa a valer no token do usuário após um novo login.',
	})
	@ApiBody({
		description: 'Lista de perfis com as operações permitidas',
		type: [CreateProfileOperationDto],
		examples: {
			validExample: {
				summary: 'Exemplo',
				value: [
					{
						identifier: 'admin',
						operations: [
							'show-users',
							'edit-users',
							'show-machines',
						],
					},
					{
						identifier: 'operador',
						operations: ['show-machines'],
					},
				],
			},
		},
	})
	@ApiCreatedResponse({
		description: 'Permissões atualizadas.',
		type: MessageResponseDto,
		schema: {
			example: { message: 'Permissoes atualizadas com sucesso!' },
		},
	})
	@ApiBadRequestResponse({
		description: 'Corpo inválido ou falha ao gravar as permissões.',
		schema: {
			example: { message: 'Ocorreu um erro ao atualizar permissoes' },
		},
	})
	create(
		@Body(new ParseArrayPipe({ items: CreateProfileOperationDto }))
		createProfileOperationDto: CreateProfileOperationDto[],
	) {
		return this.profileOperationService.create(createProfileOperationDto);
	}
}
