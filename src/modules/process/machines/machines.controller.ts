import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	Patch,
	ParseIntPipe,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginate-response.decorator';
import { PaginateOutputDto } from '../../../common/dto/paginate-output.dto';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import { ApiAuthResponses, GetCurrentUser } from '../../../common/decorators';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import {
	ListInputMachineDto,
	ListOutputMachineDto,
} from './dto/list-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { UserPayloadProps } from '../../../common/types';
import { QueryPaginationDto } from '../../../common/dto/pagination-data.dto';
import { CreateMachineListDto } from './dto/create-machine-mes.dto';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import {
	CountMessageResponseDto,
	MessageResponseDto,
} from '../../../common/dto/message-response.dto';

@Controller('machines')
@ApiTags('Machines')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class MachinesController {
	constructor(private readonly machineService: MachinesService) {}

	@Post('mes')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.SYNC))
	@ApiOperation({
		summary: 'Sincroniza máquinas a partir do MES',
		description:
			'Importa em lote a lista de máquinas informada. Registros já existentes são atualizados e desbloqueados; os demais são criados. Quando ENABLE_RMS_IMPORT for true, as rotinas e ações da máquina são copiadas do RMS logo após a sincronização, apenas para máquinas que ainda não possuam rotinas no TMDB. Falhas na comunicação com o RMS não interrompem a sincronização.',
	})
	@ApiCreatedResponse({
		description:
			'Sincronização concluída. O campo rms_import resume a cópia de rotinas do RMS: imported são as máquinas que receberam rotinas, skipped as que já tinham rotinas ou não foram encontradas no RMS, e failed as que apresentaram erro.',
		schema: {
			example: {
				message: 'Máquinas sincronizadas com sucesso',
				rms_import: {
					enabled: true,
					imported: 1,
					skipped: 1,
					failed: 0,
				},
			},
		},
	})
	createMes(@Body() createMachineListDto: CreateMachineListDto) {
		return this.machineService.createMes(createMachineListDto);
	}

	@Post()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.SYNC))
	@ApiOperation({
		summary: 'Cadastra uma máquina',
		description:
			'Cria uma máquina manualmente. O código informado deve ser único entre as máquinas não bloqueadas.',
	})
	@ApiCreatedResponse({
		description: 'Máquina cadastrada.',
		type: MessageResponseDto,
		schema: {
			example: { message: 'Máquina criada com sucesso!' },
		},
	})
	@ApiBadRequestResponse({
		description: 'Código já utilizado por outra máquina.',
		schema: {
			example: { message: 'Máquina já cadastrada' },
		},
	})
	create(
		@Body() createMachineDto: CreateMachineDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.machineService.create(createMachineDto, currentUser);
	}

	@Get()
	@ApiPaginatedResponse(ListOutputMachineDto)
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Lista as máquinas',
		description:
			'Retorna as máquinas não bloqueadas de forma paginada, ordenadas da criação mais recente para a mais antiga. Aceita filtros por descrição, código, tipo, localização e situação.',
	})
	findAll(
		@Query() listInputMachineDto: ListInputMachineDto,
	): Promise<PaginateOutputDto<ListOutputMachineDto>> {
		return this.machineService.findAll(listInputMachineDto);
	}

	@Get('select')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Lista as máquinas para seleção',
		description:
			'Retorna apenas o identificador e o código das máquinas não bloqueadas, para preenchimento de campos de seleção.',
	})
	@ApiOkResponse({
		description: 'Máquinas disponíveis.',
		schema: {
			example: [
				{ id: 1, code: 'B017' },
				{ id: 2, code: 'B018' },
			],
		},
	})
	select() {
		return this.machineService.select();
	}

	@Get('mes')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.SYNC))
	@ApiOperation({
		summary: 'Lista as máquinas disponíveis no MES',
		description:
			'Consulta as máquinas do MES e cruza com o cadastro local, indicando quais já estão registradas. Quando ENABLE_MES não for true, os dados vêm de uma lista local de exemplo. O resultado é paginado em memória.',
	})
	@ApiOkResponse({
		description: 'Máquinas do MES cruzadas com o cadastro local.',
		schema: {
			example: {
				data: [
					{
						code: 'B017',
						description: 'Machine - B017',
						location: 'AI Backend',
						type: 'Automatic Visual Inspection',
						ip_address: '192.168.0.10',
						port: '9100',
						status: 1,
						status_mes: 1,
					},
				],
				meta: {
					total: 1,
					lastPage: 1,
					currentPage: 1,
					perPage: 8,
					prev: null,
					next: null,
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Falha na consulta à API do MES.',
		schema: {
			example: {
				message:
					'Ocorreu um erro ao consultar a listagem de máquinas do MES',
			},
		},
	})
	findMes(@Query() query: QueryPaginationDto) {
		return this.machineService.findMes(query);
	}

	@Patch(':id/change-status')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.CHANGE_STATUS))
	@ApiOperation({
		summary: 'Alterna a situação da máquina',
		description:
			'Inverte a situação da máquina: registros ativos passam a inativos e vice-versa. Não exige corpo na requisição.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da máquina.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Situação alterada.',
		type: CountMessageResponseDto,
		schema: {
			example: { count: 1, message: 'Máquina desabilitada com sucesso!' },
		},
	})
	@ApiBadRequestResponse({
		description: 'Máquina inexistente ou bloqueada.',
		schema: {
			example: { message: 'Máquina não encontrada.' },
		},
	})
	changeStatus(@Param('id', ParseIntPipe) machine_id: number) {
		return this.machineService.changeStatus(machine_id);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Detalha uma máquina',
		description:
			'Retorna os dados da máquina não bloqueada correspondente ao identificador informado. Responde null quando o registro não existe.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da máquina.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Dados da máquina.',
		type: ListOutputMachineDto,
	})
	findOne(@Param('id') id: string) {
		return this.machineService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Atualiza uma máquina',
		description:
			'Altera os dados cadastrais da máquina informada. A operação registra os respectivos logs de auditoria e de notificação.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da máquina.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Máquina atualizada.',
		type: MessageResponseDto,
		schema: {
			example: { message: 'Máquina atualizada com sucesso!' },
		},
	})
	@ApiBadRequestResponse({
		description: 'Máquina inexistente ou bloqueada.',
		schema: {
			example: { message: 'Máquina  não encontrada.' },
		},
	})
	update(
		@Param('id', ParseIntPipe) machine_id: number,
		@Body() updateMachineDto: UpdateMachineDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.machineService.update(
			updateMachineDto,
			machine_id,
			currentUser,
		);
	}

	@Delete(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.DELETE))
	@ApiOperation({
		summary: 'Remove uma máquina',
		description:
			'Exclusão lógica: a máquina é marcada como bloqueada e deixa de aparecer nas consultas. As rotas vinculadas são removidas.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da máquina.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Máquina removida.',
		type: MessageResponseDto,
		schema: {
			example: { message: 'Máquina removida com sucesso!' },
		},
	})
	@ApiBadRequestResponse({
		description: 'Máquina inexistente ou com logs vinculados.',
		schema: {
			example: { message: 'A máquina possui logs vinculados' },
		},
	})
	delete(
		@Param('id', ParseIntPipe) machine_id: number,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.machineService.delete(machine_id, currentUser);
	}
}
