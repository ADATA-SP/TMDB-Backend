import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginate-response.decorator';
import { ApiAuthResponses, GetCurrentUser } from '../../../common/decorators';
import { PaginateOutputDto } from '../../../common/dto/paginate-output.dto';
import { MessageResponseDto } from '../../../common/dto/message-response.dto';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import { UserPayloadProps } from '../../../common/types';
import { ToolingsService } from './toolings.service';
import { LinkDatamatrixDto } from './dto/link-datamatrix.dto';
import {
	FindByDatamatrixInputDto,
	ListAvailableToolingDto,
	ListInputToolingDto,
	ListOutputToolingDto,
	ToolingMachineInputDto,
} from './dto/list-tooling.dto';

const toolingSnIdParam = {
	name: 'id',
	type: 'number',
	description: 'Identificador do serial do tooling no MES (TOOLING_SN_ID).',
	example: 10000816,
} as const;

const mesErrorResponse = {
	description: 'Falha na consulta à API do MES.',
	schema: {
		example: { message: 'Ocorreu um erro ao consultar os toolings do MES' },
	},
};

@Controller('toolings')
@ApiTags('Toolings')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class ToolingsController {
	constructor(private readonly toolingsService: ToolingsService) {}

	@Get()
	@ApiPaginatedResponse(ListOutputToolingDto)
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.READ))
	@ApiOperation({
		summary: 'Lista os toolings',
		description:
			'Consulta os toolings no MES SAO e acrescenta o Data Matrix vinculado no TMDB. Com machine_id, retorna apenas os toolings montados na máquina. A paginação e os filtros de busca (nome, tipo ou serial), nome exato e situação do vínculo são aplicados em memória.',
	})
	@ApiBadRequestResponse(mesErrorResponse)
	@ApiNotFoundResponse({
		description: 'Máquina inexistente ou bloqueada.',
		schema: { example: { message: 'Máquina não encontrada.' } },
	})
	findAll(
		@Query() listInputToolingDto: ListInputToolingDto,
	): Promise<PaginateOutputDto<ListOutputToolingDto>> {
		return this.toolingsService.findAll(listInputToolingDto);
	}

	@Get('names')
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.READ))
	@ApiOperation({
		summary: 'Lista os nomes de toolings',
		description:
			'Retorna os nomes distintos dos toolings do MES, em ordem alfabética, para o filtro por nome.',
	})
	@ApiOkResponse({
		description: 'Nomes distintos.',
		schema: { example: ['Etool_4needle_8mm_r0.25mm', 'Ftool_7.4x3.9mm'] },
	})
	@ApiBadRequestResponse(mesErrorResponse)
	findNames(@Query() toolingMachineInputDto: ToolingMachineInputDto) {
		return this.toolingsService.findNames(toolingMachineInputDto);
	}

	@Get('available')
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.READ))
	@ApiOperation({
		summary: 'Lista os toolings disponíveis no MES',
		description:
			'Retorna os toolings habilitados no MES que não estão montados em máquina nem em uso.',
	})
	@ApiOkResponse({
		description: 'Toolings disponíveis.',
		schema: {
			example: [
				{
					id: 10000864,
					tooling_sn: 'MAGCOK001',
					tooling_id: 10130,
					code: '12345678',
					name: 'COK_EMMC',
					type: 'COK',
					description: 'COK_TEST_MAGV',
				},
			],
		},
	})
	@ApiBadRequestResponse(mesErrorResponse)
	findAvailable(@Query() listAvailableToolingDto: ListAvailableToolingDto) {
		return this.toolingsService.findAvailable(listAvailableToolingDto);
	}

	@Get('by-datamatrix')
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.READ))
	@ApiOperation({
		summary: 'Busca o tooling vinculado a um Data Matrix',
		description:
			'Usado para verificar, antes de confirmar um vínculo, se o Data Matrix lido já pertence a algum tooling. Responde null quando nenhum tooling possui o código.',
	})
	@ApiOkResponse({
		description: 'Tooling vinculado ao Data Matrix, ou null.',
		type: ListOutputToolingDto,
	})
	findByDatamatrix(@Query() { datamatrix }: FindByDatamatrixInputDto) {
		return this.toolingsService.findByDatamatrix(datamatrix);
	}

	@Get(':id')
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.READ))
	@ApiOperation({
		summary: 'Detalha um tooling',
		description:
			'Retorna os dados do serial no MES e o Data Matrix vinculado no TMDB.',
	})
	@ApiParam(toolingSnIdParam)
	@ApiOkResponse({
		description: 'Dados do tooling.',
		type: ListOutputToolingDto,
	})
	@ApiNotFoundResponse({
		description: 'Serial inexistente no MES.',
		schema: { example: { message: 'Tooling não encontrado no MES.' } },
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.toolingsService.findOne(id);
	}

	@Get(':id/history')
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.READ))
	@ApiOperation({
		summary: 'Histórico de uso do tooling',
		description:
			'Retorna, a partir do MES, as montagens do serial em máquinas e os contadores de uso.',
	})
	@ApiParam(toolingSnIdParam)
	@ApiOkResponse({
		description: 'Histórico de uso.',
		schema: {
			example: [
				{
					machine_code: 'DA01',
					machine_description: 'Flash DB830 Plus+ - 220000635',
					machine_localization: 'AI Frontend',
					total_used: 5741,
					used_count: 0,
					up_time: '2026-05-08T18:15:33.000Z',
					up_emp_no: '61000567',
					down_time: null,
					down_emp_no: null,
				},
			],
		},
	})
	@ApiBadRequestResponse(mesErrorResponse)
	findHistory(@Param('id', ParseIntPipe) id: number) {
		return this.toolingsService.findHistory(id);
	}

	@Put(':id/datamatrix')
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.LINK_DATAMATRIX))
	@ApiOperation({
		summary: 'Vincula ou altera o Data Matrix do tooling',
		description:
			'Vincula o Data Matrix lido ao serial do MES, substituindo o atual quando houver. O código não pode ser igual ao já vinculado nem pertencer a outro tooling (comparação sem diferenciar maiúsculas e minúsculas).',
	})
	@ApiParam(toolingSnIdParam)
	@ApiOkResponse({
		description: 'Data Matrix vinculado.',
		type: MessageResponseDto,
		schema: { example: { message: 'Data Matrix vinculado com sucesso!' } },
	})
	@ApiBadRequestResponse({
		description: 'Data Matrix igual ao já vinculado.',
		schema: {
			example: { message: 'Este Data Matrix já pertence ao tooling.' },
		},
	})
	@ApiNotFoundResponse({
		description: 'Serial inexistente no MES.',
		schema: { example: { message: 'Tooling não encontrado no MES.' } },
	})
	@ApiConflictResponse({
		description: 'Data Matrix vinculado a outro tooling.',
		schema: {
			example: {
				message:
					'Este Data Matrix já está vinculado ao tooling 05_08_2021 X 4.',
			},
		},
	})
	linkDatamatrix(
		@Param('id', ParseIntPipe) id: number,
		@Body() linkDatamatrixDto: LinkDatamatrixDto,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.toolingsService.linkDatamatrix(
			id,
			linkDatamatrixDto,
			currentUser,
		);
	}

	@Delete(':id/datamatrix')
	@UseGuards(PermissionGuard(OperationsModule.TOOLINGS.LINK_DATAMATRIX))
	@ApiOperation({
		summary: 'Desvincula o Data Matrix do tooling',
		description:
			'Remove o vínculo do Data Matrix com o serial, que passa à situação UNLINKED.',
	})
	@ApiParam(toolingSnIdParam)
	@ApiOkResponse({
		description: 'Data Matrix desvinculado.',
		type: MessageResponseDto,
		schema: {
			example: { message: 'Data Matrix desvinculado com sucesso!' },
		},
	})
	@ApiBadRequestResponse({
		description: 'Tooling sem Data Matrix vinculado.',
		schema: {
			example: {
				message: 'O tooling não possui Data Matrix vinculado.',
			},
		},
	})
	unlinkDatamatrix(
		@Param('id', ParseIntPipe) id: number,
		@GetCurrentUser() currentUser: UserPayloadProps,
	) {
		return this.toolingsService.unlinkDatamatrix(id, currentUser);
	}
}
