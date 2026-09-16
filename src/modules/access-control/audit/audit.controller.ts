import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginate-response.decorator';
import { PaginateOutputDto } from '../../../common/dto/paginate-output.dto';
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import {
	ListInputAuditLogDto,
	ListOutputAuditDto,
} from './dto/list-audit-log.dto';
import { AuditLogService } from './audit.service';
import { Response } from 'express';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import { ExportDto } from '../../../common/dto/list-file.dto';
import { ApiAuthResponses } from '../../../common/decorators';

@Controller('change-log')
@ApiTags('Change Log')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class AuditLogController {
	constructor(private readonly auditLogService: AuditLogService) {}

	@Get()
	@ApiPaginatedResponse(ListOutputAuditDto)
	@UseGuards(PermissionGuard(OperationsModule.CHANGE_LOG.READ))
	@ApiOperation({
		summary: 'Lista o registro de alterações',
		description:
			'Retorna a trilha de auditoria de forma paginada, da alteração mais recente para a mais antiga. Cada registro traz a entidade alterada, a operação realizada e o usuário responsável. Aceita filtro por descrição e por período.',
	})
	findAll(
		@Query() listInputAuditLogDto: ListInputAuditLogDto,
	): Promise<PaginateOutputDto<ListOutputAuditDto>> {
		return this.auditLogService.findAll(listInputAuditLogDto);
	}

	@Get('reports')
	@UseGuards(PermissionGuard(OperationsModule.CHANGE_LOG.READ))
	@ApiOperation({
		summary: 'Exporta o registro de alterações',
		description:
			'Gera o relatório completo da trilha de auditoria em PDF ou Excel. O arquivo é devolvido diretamente no corpo da resposta.',
	})
	@ApiQuery({
		name: 'type',
		enum: ['pdf', 'excel'],
		required: true,
		description: 'Tipo de exportação',
		example: 'pdf',
	})
	@ApiOkResponse({
		description: 'Arquivo gerado.',
		content: {
			'application/pdf': {},
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				{},
		},
	})
	report(@Query() exportDto: ExportDto, @Res() res: Response) {
		return this.auditLogService.report(res, exportDto);
	}
}
