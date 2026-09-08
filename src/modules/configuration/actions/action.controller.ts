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
import { ActionService } from './action.service';
import { CreateActionDto } from './dto/create-action.dto';
import { ListInputActionDto, ListOutputActionDto } from './dto/list-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { ApiAuthResponses } from '../../../common/decorators';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import {
	CountMessageResponseDto,
	MessageResponseDto,
} from '../../../common/dto/message-response.dto';

@Controller('configuration/actions')
@ApiTags('Configuration / Actions')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class ActionController {
	constructor(private readonly actionService: ActionService) {}

	@Post()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Cria uma ação',
		description:
			'Cadastra uma ação executável em máquinas de um determinado tipo. O par nome e descrição deve ser único.',
	})
	@ApiCreatedResponse({
		description: 'Ação cadastrada.',
		type: CountMessageResponseDto,
		schema: { example: { count: 1 } },
	})
	@ApiBadRequestResponse({
		description: 'Já existe uma ação com o mesmo nome e descrição.',
		schema: {
			example: {
				message: 'Já existe uma ação com esse nome e descrição.',
			},
		},
	})
	create(@Body() createActionDto: CreateActionDto) {
		return this.actionService.create(createActionDto);
	}

	@Get()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Lista as ações',
		description:
			'Retorna todas as ações cadastradas. Aceita filtros por descrição e por tipo de máquina.',
	})
	@ApiOkResponse({
		description: 'Ações cadastradas.',
		type: [ListOutputActionDto],
	})
	findAll(@Query() listInputActionDto: ListInputActionDto) {
		return this.actionService.findAll(listInputActionDto);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Detalha uma ação',
		description:
			'Retorna os dados da ação correspondente ao identificador informado.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da ação.',
		example: 1,
	})
	@ApiOkResponse({ description: 'Dados da ação.', type: ListOutputActionDto })
	@ApiNotFoundResponse({
		description: 'Ação inexistente.',
		schema: { example: { message: 'Ação não encontrada!' } },
	})
	findOne(@Param('id') id: string) {
		return this.actionService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Atualiza uma ação',
		description: 'Altera os dados da ação informada.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da ação.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Ação atualizada.',
		type: MessageResponseDto,
		schema: { example: { message: 'Ação atualizada com sucesso!' } },
	})
	@ApiBadRequestResponse({
		description: 'Ação inexistente.',
		schema: { example: { message: 'Ação  não encontrada.' } },
	})
	update(
		@Param('id', ParseIntPipe) action_id: number,
		@Body() updateActionDto: UpdateActionDto,
	) {
		return this.actionService.update(updateActionDto, action_id);
	}

	@Delete(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.DELETE))
	@ApiOperation({
		summary: 'Remove uma ação',
		description:
			'Exclui a ação informada e os vínculos dela com as rotinas que a utilizavam.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador da ação.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Ação removida.',
		type: MessageResponseDto,
		schema: { example: { message: 'Ação removida com sucesso!' } },
	})
	@ApiBadRequestResponse({
		description: 'Ação inexistente.',
		schema: { example: { message: 'Ação  não encontrada.' } },
	})
	delete(@Param('id', ParseIntPipe) action_id: number) {
		return this.actionService.delete(action_id);
	}
}
