import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	Put,
	Patch,
	ParseIntPipe,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchAccountNameDto } from './dto/search-user.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginate-response.decorator';
import { ListInputUserDto, ListOutputUserDto } from './dto/list-user.dto';
import { PaginateOutputDto } from '../../common/dto/paginate-output.dto';
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
import { ChangePasswordUserDto } from './dto/change-password-user.dto';
import { ApiAuthResponses, GetCurrentUser } from '../../common/decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPayloadProps } from '../../common/types';
import { PermissionGuard } from '../../common/guards';
import { OperationsModule } from '../../common/constants';
import {
	CountMessageResponseDto,
	MessageResponseDto,
} from '../../common/dto/message-response.dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@UseGuards(PermissionGuard(OperationsModule.USERS.CREATE))
	@ApiOperation({
		summary: 'Cria um usuário',
		description:
			'Cadastra um novo usuário no TMDB. O nome de conta deve ser único. Quando a senha é informada, ela é armazenada de forma criptografada; caso contrário, o acesso ocorre somente via LDAP.',
	})
	@ApiCreatedResponse({
		description: 'Usuário cadastrado.',
		type: MessageResponseDto,
		schema: {
			example: {
				message: 'Usuário criado com sucesso!',
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Nome de conta já cadastrado ou dados inválidos.',
		schema: {
			example: {
				message: 'Usuário já cadastrado',
			},
		},
	})
	create(
		@Body() createUserDto: CreateUserDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.usersService.create(createUserDto, currentUser);
	}

	@Get()
	@ApiPaginatedResponse(ListOutputUserDto)
	@UseGuards(PermissionGuard(OperationsModule.USERS.READ))
	@ApiOperation({
		summary: 'Lista os usuários',
		description:
			'Retorna os usuários de forma paginada, ordenados da criação mais recente para a mais antiga. Aceita filtro por nome e por situação.',
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
		@Query() listInputUserDto: ListInputUserDto,
	): Promise<PaginateOutputDto<ListOutputUserDto>> {
		return this.usersService.findAll(listInputUserDto);
	}

	@Get('search-account-name')
	@UseGuards(PermissionGuard(OperationsModule.USERS.READ))
	@ApiOperation({
		summary: 'Pesquisa contas no diretório LDAP',
		description:
			'Consulta o servidor LDAP pelo nome de conta informado e retorna as entradas correspondentes. Utilizada para localizar usuários do domínio antes do cadastro no TMDB.',
	})
	@ApiOkResponse({
		description: 'Entradas localizadas no diretório.',
		schema: {
			example: [
				{
					dn: 'CN=Usuario Exemplo,OU=Usuarios,DC=exemplo,DC=com',
					sAMAccountName: 'usuario.exemplo',
					mail: 'user@exemplo.com',
					displayName: 'Usuario Exemplo',
				},
			],
		},
	})
	@ApiBadRequestResponse({
		description: 'Falha na consulta ao servidor LDAP.',
		schema: {
			example: {
				statusCode: 400,
				message: 'Erro ao consultar o servidor LDAP',
				error: 'Bad Request',
			},
		},
	})
	searchAccountName(@Query() searchAccountNameDto: SearchAccountNameDto) {
		return this.usersService.searchAccountName(searchAccountNameDto);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.USERS.READ))
	@ApiOperation({
		summary: 'Detalha um usuário',
		description:
			'Retorna os dados cadastrais do usuário correspondente ao identificador informado. Responde null quando o registro não existe.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do usuário.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Dados do usuário.',
		type: ListOutputUserDto,
	})
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(PermissionGuard(OperationsModule.USERS.UPDATE))
	@ApiOperation({
		summary: 'Atualiza um usuário',
		description:
			'Altera os dados cadastrais do usuário informado. O nome de conta não pode ser alterado. Quando a senha é enviada, ela é recriptografada.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do usuário.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Usuário atualizado.',
		type: MessageResponseDto,
		schema: {
			example: {
				message: 'Usuário atualizado com sucesso!',
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'Usuário inexistente ou e-mail já utilizado por outro cadastro.',
		schema: {
			example: {
				message: 'E-mail de usuário já cadastrado',
			},
		},
	})
	update(
		@Param('id', ParseIntPipe) user_id: number,
		@Body() updateUserDto: UpdateUserDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.usersService.update(updateUserDto, user_id, currentUser);
	}

	@Patch(':id/change-status')
	@UseGuards(PermissionGuard(OperationsModule.USERS.CHANGE_STATUS))
	@ApiOperation({
		summary: 'Alterna a situação do usuário',
		description:
			'Inverte a situação do usuário: registros ativos passam a inativos e vice-versa. Não exige corpo na requisição.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do usuário.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Situação alterada.',
		type: CountMessageResponseDto,
		schema: {
			example: {
				count: 1,
				message: 'Usuário desativado com sucesso!',
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Usuário inexistente.',
		schema: {
			example: {
				message: 'Usuário  não encontrado.',
			},
		},
	})
	changeStatus(@Param('id', ParseIntPipe) user_id: number) {
		return this.usersService.changeStatus(user_id);
	}

	@Put('change-password')
	@UseGuards(PermissionGuard(OperationsModule.USERS.UPDATE))
	@ApiOperation({
		summary: 'Altera a senha de um usuário',
		description:
			'Substitui a senha local do usuário identificado pelo nome de conta. Os campos password e confirmPassword devem ser idênticos.',
	})
	@ApiOkResponse({
		description: 'Senha alterada.',
		type: MessageResponseDto,
		schema: {
			example: {
				message: 'Senha do usuário alterada com sucesso!',
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'A confirmação de senha não corresponde à senha informada.',
		schema: {
			example: {
				property: 'confirmPassword',
				message: 'A confirmação de senha  não é igual',
				statusCode: 400,
				error: 'Bad Request',
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Nome de conta não localizado no TMDB.',
		schema: {
			example: {
				message: 'Usuário  não identificado no TMDB',
			},
		},
	})
	changePassword(@Body() changePasswordDto: ChangePasswordUserDto) {
		return this.usersService.changePassword(changePasswordDto);
	}

	@Delete(':id')
	@UseGuards(PermissionGuard(OperationsModule.USERS.DELETE))
	@ApiOperation({
		summary: 'Remove um usuário',
		description:
			'Exclui o usuário informado. O usuário autenticado não pode remover o próprio cadastro.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do usuário.',
		example: 2,
	})
	@ApiOkResponse({
		description: 'Usuário removido.',
		type: MessageResponseDto,
		schema: {
			example: {
				message: 'Usuário removido com sucesso.',
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'Usuário inexistente ou tentativa de remover o próprio cadastro.',
		schema: {
			example: {
				statusCode: 400,
				message:
					'não é possível excluir o próprio usuário que está logado.',
				error: 'Bad Request',
			},
		},
	})
	delete(
		@Param('id', ParseIntPipe) user_id: number,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.usersService.delete(user_id, currentUser);
	}
}
