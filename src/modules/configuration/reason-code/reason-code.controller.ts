import {
	Controller,
	Get,
	Param,
	Query,
	Patch,
	ParseIntPipe,
	Delete,
	Body,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { ReasonCodeService } from './reason-code.service';
import {
	ListInputReasonCodeDto,
	ListOutputReasonCodeDto,
} from './dto/list-reason-code.dto';
import { UpdateReasonCodeDto } from './dto/update-reason-code.dto';
import { ApiAuthResponses } from '../../../common/decorators';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import { MessageResponseDto } from '../../../common/dto/message-response.dto';

@Controller('configuration/reason-code')
@ApiTags('Configuration / Reason Codes')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class ReasonCodeController {
	constructor(private readonly reasonCodeService: ReasonCodeService) {}

	@Get()
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Lista os códigos de motivo',
		description:
			'Retorna os códigos de motivo cadastrados. Aceita filtro por código.',
	})
	@ApiOkResponse({
		description: 'Códigos encontrados.',
		type: [ListOutputReasonCodeDto],
	})
	findAll(@Query() listInputReasonCodeDto: ListInputReasonCodeDto) {
		return this.reasonCodeService.findAll(listInputReasonCodeDto);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.READ))
	@ApiOperation({
		summary: 'Detalha um código de motivo',
		description:
			'Retorna o código de motivo correspondente ao identificador informado.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do código de motivo.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Código encontrado.',
		type: ListOutputReasonCodeDto,
	})
	@ApiNotFoundResponse({
		description: 'Código inexistente.',
		schema: { example: { message: 'Reason code não encontrado!' } },
	})
	findOne(@Param('id') id: string) {
		return this.reasonCodeService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.UPDATE))
	@ApiOperation({
		summary: 'Atualiza um código de motivo',
		description:
			'Altera o código e o indicador de ignorado do registro informado.',
	})
	@ApiParam({
		name: 'id',
		type: 'number',
		description: 'Identificador do código de motivo.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Código atualizado.',
		type: MessageResponseDto,
		schema: {
			example: { message: 'Reason code atualizado com sucesso!' },
		},
	})
	@ApiBadRequestResponse({
		description: 'Código inexistente.',
		schema: { example: { message: 'Reason code  não encontrado.' } },
	})
	update(
		@Param('id', ParseIntPipe) reason_code_id: number,
		@Body() updateReasonCodeDto: UpdateReasonCodeDto,
	) {
		return this.reasonCodeService.update(
			updateReasonCodeDto,
			reason_code_id,
		);
	}

	@Delete(':reason_code')
	@UseGuards(PermissionGuard(OperationsModule.MACHINES.DELETE))
	@ApiOperation({
		summary: 'Remove um código de motivo de uma rotina',
		description:
			'Exclui o vínculo do código de motivo informado com a rotina indicada na query.',
	})
	@ApiParam({
		name: 'reason_code',
		type: 'string',
		description: 'Código de motivo.',
		example: 'R001',
	})
	@ApiQuery({
		name: 'routine_id',
		type: 'number',
		description: 'Identificador da rotina à qual o código está associado.',
		example: 1,
	})
	@ApiOkResponse({
		description: 'Código removido.',
		type: MessageResponseDto,
		schema: { example: { message: 'Reason code removido com sucesso!' } },
	})
	@ApiBadRequestResponse({
		description: 'Código inexistente para a rotina informada.',
		schema: { example: { message: 'Reason code não encontrado.' } },
	})
	delete(
		@Query('routine_id', ParseIntPipe) routine_id: number,
		@Param('reason_code') reason_code: string,
	) {
		return this.reasonCodeService.delete(reason_code, routine_id);
	}
}
