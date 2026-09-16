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
import { NotificationService } from './notification.service';
import {
	ListInputNotificationDto,
	ListOutputNotificationDto,
} from './dto/list-notification.dto';
import { Response } from 'express';
import { PermissionGuard } from '../../../common/guards';
import { OperationsModule } from '../../../common/constants';
import { ExportDto } from '../../../common/dto/list-file.dto';
import { ApiAuthResponses } from '../../../common/decorators';

@Controller('notification-log')
@ApiTags('Notification Log')
@ApiBearerAuth('JWT-auth')
@ApiAuthResponses()
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@ApiPaginatedResponse(ListOutputNotificationDto)
	@UseGuards(PermissionGuard(OperationsModule.NOTIFICATIONS.READ))
	@ApiOperation({
		summary: 'Lista o histórico de notificações',
		description:
			'Retorna as notificações registradas de forma paginada, da mais recente para a mais antiga, acompanhadas do usuário notificado. Aceita filtro por descrição e por período.',
	})
	findAll(
		@Query() listInputNotificationDto: ListInputNotificationDto,
	): Promise<PaginateOutputDto<ListOutputNotificationDto>> {
		return this.notificationService.findAll(listInputNotificationDto);
	}

	@Get('reports')
	@UseGuards(PermissionGuard(OperationsModule.NOTIFICATIONS.READ))
	@ApiOperation({
		summary: 'Exporta o histórico de notificações',
		description:
			'Gera o relatório completo das notificações em PDF ou Excel. O arquivo é devolvido diretamente no corpo da resposta.',
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
		return this.notificationService.report(res, exportDto);
	}
}
