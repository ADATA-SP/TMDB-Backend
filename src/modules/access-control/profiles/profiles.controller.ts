import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	Patch,
	Delete,
	UseGuards,
	ParseIntPipe,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import {
	ListInputProfileDto,
	ListOutputProfileDto,
} from './dto/list-profile.dto';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginate-response.decorator';
import { PaginateOutputDto } from '../../../common/dto/paginate-output.dto';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import { ApiAuthResponses, GetCurrentUser } from '../../../common/decorators';
import { UserPayloadProps } from '../../../common/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import {
	CountMessageResponseDto,
	MessageResponseDto,
} from '../../../common/dto/message-response.dto';

@Controller('profiles')
@ApiTags('Profiles')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class ProfilesController {
	constructor(private readonly profilesService: ProfilesService) {}

	@Post()
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.UPDATE))
	@ApiOperation({
		summary: 'Cria um perfil de acesso',
		description:
			'Cadastra um novo perfil de acesso. O identificador informado deve ser único entre os perfis existentes.',
	})
	@ApiCreatedResponse({
		description: 'Perfil cadastrado.',
		type: CountMessageResponseDto,
		schema: {
			example: {
				count: 1,
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Identificador já utilizado por outro perfil.',
		schema: {
			example: {
				message: 'Já existe um perfil com esse identificador',
			},
		},
	})
	create(@Body() createProfileDto: CreateProfileDto) {
		return this.profilesService.create(createProfileDto);
	}

	@Get()
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.READ))
	@ApiPaginatedResponse(ListOutputProfileDto)
	@ApiOperation({
		summary: 'Lista os perfis de acesso',
		description:
			'Retorna os perfis de forma paginada, ordenados da criação mais recente para a mais antiga. Aceita filtro por descrição.',
	})
	@ApiBadRequestResponse({
		description: 'Parâmetros de paginação ou de filtro inválidos.',
		schema: {
			example: {
				property: 'page',
				message: 'Campo  não pode estar vazio!',
				statusCode: 400,
				error: 'Bad Request',
			},
		},
	})
	findAll(
		@Query() listInputProfileDto: ListInputProfileDto,
	): Promise<PaginateOutputDto<ListOutputProfileDto>> {
		return this.profilesService.findAll(listInputProfileDto);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.READ))
	@ApiOperation({
		summary: 'Detalha um perfil de acesso',
		description:
			'Retorna os dados do perfil correspondente ao identificador informado.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do perfil.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Dados do perfil.',
		type: ListOutputProfileDto,
	})
	@ApiNotFoundResponse({
		description: 'Perfil inexistente.',
		schema: {
			example: {
				message: 'Perfil  não encontrado!',
			},
		},
	})
	findOne(@Param('id') id: string) {
		return this.profilesService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.UPDATE))
	@ApiOperation({
		summary: 'Atualiza um perfil de acesso',
		description:
			'Altera a descrição e o identificador do perfil informado. O identificador deve permanecer único. A operação registra os respectivos logs de auditoria e de notificação.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do perfil.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Perfil atualizado.',
		type: MessageResponseDto,
		schema: {
			example: {
				message: 'Perfil atualizado com sucesso!',
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'Perfil inexistente ou identificador já utilizado por outro perfil.',
		schema: {
			example: {
				message: 'Já existe um perfil com esse identificador.',
			},
		},
	})
	update(
		@Param('id', ParseIntPipe) user_id: number,
		@Body() updateMachineDto: UpdateProfileDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.profilesService.update(
			updateMachineDto,
			user_id,
			currentUser,
		);
	}

	@Delete(':id')
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.UPDATE))
	@ApiOperation({
		summary: 'Remove um perfil de acesso',
		description:
			'Exclui o perfil informado. A remoção é bloqueada quando o perfil possui operações associadas ou usuários vinculados.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do perfil.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Perfil removido.',
		type: MessageResponseDto,
		schema: {
			example: {
				message: 'Perfil removido com sucesso!',
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Perfil inexistente ou em uso por operações e usuários.',
		schema: {
			example: {
				message: 'Este perfil já está sendo usado.',
			},
		},
	})
	delete(
		@Param('id', ParseIntPipe) user_id: number,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.profilesService.delete(user_id, currentUser);
	}

	@Patch(':id/change-status')
	@UseGuards(PermissionGuard(OperationsModule.PERMISSION.UPDATE))
	@ApiOperation({
		summary: 'Alterna a situação do perfil',
		description:
			'Inverte a situação do perfil: registros ativos passam a inativos e vice-versa. Não exige corpo na requisição.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do perfil.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Situação alterada.',
		type: CountMessageResponseDto,
		schema: {
			example: {
				count: 1,
				message: 'Perfil desabilitado com sucesso!',
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Perfil inexistente.',
		schema: {
			example: {
				message: 'Perfil não encontrado.',
			},
		},
	})
	changeStatus(@Param('id', ParseIntPipe) profile_id: number) {
		return this.profilesService.changeStatus(profile_id);
	}
}
