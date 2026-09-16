import {
	Controller,
	Get,
	Body,
	Param,
	Query,
	Patch,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import { RoutineActionService } from './routine-action.service';
import { CreateRoutineActionDto } from './dto/create-routine-action.dto';
import {
	ListInputRoutineActionDto,
	ListOutputRoutineActionDto,
} from './dto/list-routine-action.dto';
import { ApiAuthResponses } from '../../../common/decorators';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import { MessageResponseDto } from '../../../common/dto/message-response.dto';

@Controller('configuration/routines-action')
@ApiTags('Configuration / Routine Action')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class RoutineActionController {
	constructor(private readonly routineActionService: RoutineActionService) {}

	@Patch()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Define as ações de uma rotina',
		description:
			'Substitui integralmente as ações vinculadas à rotina pela lista informada, respeitando a ordem de posição. Também atualiza as opções de validação de receita.',
	})
	@ApiOkResponse({
		description: 'Vínculos atualizados.',
		type: MessageResponseDto,
		schema: { example: { message: 'Rotina atualizada com sucesso' } },
	})
	@ApiNotFoundResponse({
		description: 'Rotina inexistente.',
		schema: { example: { message: 'Rotina não encontrada' } },
	})
	create(@Body() createRoutineAction: CreateRoutineActionDto) {
		return this.routineActionService.create(createRoutineAction);
	}

	@Get()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Lista os vínculos de ações',
		description:
			'Retorna os vínculos entre rotinas e ações. Aceita filtro por rotina.',
	})
	@ApiOkResponse({
		description: 'Vínculos encontrados.',
		type: [ListOutputRoutineActionDto],
	})
	findAll(@Query() listInputRoutineActionDto: ListInputRoutineActionDto) {
		return this.routineActionService.findAll(listInputRoutineActionDto);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Detalha o primeiro vínculo de uma rotina',
		description:
			'Retorna o primeiro vínculo de ação encontrado para a rotina informada.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da rotina.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Vínculo encontrado.',
		type: ListOutputRoutineActionDto,
	})
	@ApiNotFoundResponse({
		description: 'Rotina sem vínculos ou inexistente.',
		schema: { example: { message: 'Rotina não encontrada!' } },
	})
	findOne(@Param('id') id: string) {
		return this.routineActionService.findOne(+id);
	}
}
