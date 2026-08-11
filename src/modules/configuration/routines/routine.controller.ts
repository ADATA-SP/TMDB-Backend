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
import { RoutineService } from './routine.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import {
	ListInputRoutineDto,
	ListOutputRoutineDto,
} from './dto/list-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ExecuteRoutineDto } from './dto/execute-routine.dto';
import { ApiAuthResponses } from '../../../common/decorators';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import {
	CountMessageResponseDto,
	MessageResponseDto,
} from '../../../common/dto/message-response.dto';

@Controller('configuration/routines')
@ApiTags('Configuration / Routines')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class RoutineController {
	constructor(private readonly routineService: RoutineService) {}

	@Post()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Cria uma rotina',
		description:
			'Cadastra uma rotina para uma máquina, associada a um estado do MES. As ações executadas são vinculadas depois, em /configuration/routines-action.',
	})
	@ApiCreatedResponse({
		description: 'Rotina cadastrada.',
		type: CountMessageResponseDto,
		schema: { example: { count: 1 } },
	})
	create(@Body() createRoutineDto: CreateRoutineDto) {
		return this.routineService.create(createRoutineDto);
	}

	@Post('execute-command')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Executa a rotina em uma máquina',
		description:
			'Dispara, em ordem de posição, os comandos das ações vinculadas à rotina, enviando-os à máquina pelo Data Collection. Respeita o intervalo configurado entre as ações. Máquinas inativas são ignoradas.',
	})
	@ApiOkResponse({ description: 'Comandos enviados à máquina.' })
	@ApiBadRequestResponse({
		description:
			'Máquina ou rotina inexistente, ou falha na comunicação com o Data Collection.',
		schema: {
			example: {
				message: 'Máquina associada a rotina nao encontrada!',
			},
		},
	})
	executeCommand(@Body() executeRoutineDto: ExecuteRoutineDto) {
		return this.routineService.executeCommand(executeRoutineDto);
	}

	@Get('types')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Lista os estados que disparam rotinas',
		description:
			'Retorna os estados de máquina do MES disponíveis para vincular a uma rotina.',
	})
	@ApiOkResponse({
		description: 'Estados disponíveis.',
		schema: {
			example: [
				{ id: 'RUN', value: 'RUN' },
				{ id: 'SETUP', value: 'SETUP' },
			],
		},
	})
	getAlltypes() {
		return this.routineService.getAlltypes();
	}

	@Get(':id/machine-type/:machine_type')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Detalha uma rotina por tipo de máquina',
		description:
			'Retorna a rotina informada com suas ações vinculadas. O parâmetro machine_type é aceito na rota mas não é utilizado no filtro.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da rotina.',
		example: 1,
	})
	@ApiParam({
		name: 'machine_type',
		type: 'string',
		description: 'Tipo da máquina.',
		example: 'Automatic Visual Inspection',
	})
	@ApiNotFoundResponse({
		description: 'Rotina inexistente.',
		schema: { example: { message: 'Rotina não encontrada!' } },
	})
	findOneByMachineType(@Param('id') id: string) {
		return this.routineService.findOneByMachineType(+id);
	}

	@Get()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Lista as rotinas',
		description:
			'Retorna as rotinas com suas ações e códigos de motivo. Aceita filtros por estado e por máquina.',
	})
	@ApiOkResponse({
		description: 'Rotinas cadastradas.',
		type: [ListOutputRoutineDto],
	})
	findAll(@Query() listInputRoutineDto: ListInputRoutineDto) {
		return this.routineService.findAll(listInputRoutineDto);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Detalha uma rotina',
		description:
			'Retorna a rotina informada com as ações vinculadas, em ordem de posição.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da rotina.',
		example: 1,
	})
	@ApiNotFoundResponse({
		description: 'Rotina inexistente.',
		schema: { example: { message: 'Rotina não encontrada!' } },
	})
	findOne(@Param('id') id: string) {
		return this.routineService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Atualiza uma rotina',
		description:
			'Altera os dados da rotina informada. Códigos de motivo enviados são acrescentados aos existentes.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da rotina.',
		example: 1,
	})
	@ApiBadRequestResponse({
		description: 'Rotina inexistente.',
		schema: { example: { message: 'Rotina  não encontrada.' } },
	})
	update(
		@Param('id', ParseIntPipe) routine_id: number,
		@Body() updateRoutineDto: UpdateRoutineDto,
	) {
		return this.routineService.update(updateRoutineDto, routine_id);
	}

	@Delete(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.DELETE))
	@ApiOperation({
		summary: 'Remove uma rotina',
		description:
			'Exclui a rotina informada, junto das ações vinculadas e dos códigos de motivo associados.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da rotina.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Rotina removida.',
		type: MessageResponseDto,
		schema: { example: { message: 'Rotina removida com sucesso!' } },
	})
	@ApiBadRequestResponse({
		description: 'Rotina inexistente.',
		schema: { example: { message: 'Rotina  não encontrada.' } },
	})
	delete(@Param('id', ParseIntPipe) routine_id: number) {
		return this.routineService.delete(routine_id);
	}
}
