import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { createPaginator } from 'prisma-pagination';
import { Prisma as PrismaType } from '.prisma/client';
import {
	ListInputNotificationDto,
	ListOutputNotificationDto,
} from './dto/list-notification.dto';
import { PdfService } from '../../../common/services/pdf';
import { formatShortDate } from '../../../common/functions/format-date.function';
import { Response } from 'express';
import { findManyNotificationQuery } from '../../../utils/prisma/prisma-notification-log.utils';
import { ExportDto } from '../../../common/dto/list-file.dto';
import { ExcelService } from '../../../common/services';
import { buildDateWhereClause } from '../../../common/functions/date-filter.function';

@Injectable()
export class NotificationService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly pdfService: PdfService,
		private readonly excelService: ExcelService,
	) {}

	async findAll(listInputNotificationDto: ListInputNotificationDto) {
		const { offset, page, description, start, end } =
			listInputNotificationDto;
		let whereClause: PrismaType.notification_logWhereInput = {};

		const filterData = buildDateWhereClause(
			'created_at',
			start,
			end,
			whereClause,
		);

		if (filterData) whereClause = { ...filterData };

		if (description)
			whereClause = {
				...whereClause,
				description: { contains: description },
			};

		const paginate = createPaginator({
			perPage: offset,
			page: page,
		});

		return paginate<
			ListOutputNotificationDto,
			PrismaType.notification_logFindManyArgs
		>(this.prismaService.notification_log, {
			where: { ...whereClause },
			include: { users: { select: { name: true } } },
			orderBy: {
				created_at: 'desc',
			},
		});
	}

	async report(res: Response, exportDto: ExportDto) {
		const notifications =
			await this.prismaService.notification_log.findMany({
				...findManyNotificationQuery(),
				orderBy: { created_at: 'desc' },
			});

		const columns = [
			{ label: 'Notificado', column: 'username' },
			{ label: 'Notificação', column: 'type' },
			{ label: 'Descrição', column: 'description' },
			{ label: 'Data - Hora', column: 'created_at' },
		];

		const pdfData = notifications?.map((item) => ({
			username: item?.users?.name,
			type: item?.type,
			description: item?.description,
			created_at: formatShortDate(item?.created_at.toString()),
		}));

		if (exportDto.type == 'pdf')
			return this.pdfService.generateDynamicTablePDF(
				res,
				columns,
				pdfData,
				{
					filename: 'download_report_notification',
					title: 'Relatório de Notificações',
				},
			);

		return this.excelService.generateExcel(
			res,
			pdfData,
			'Relatório de Notificações',
			columns,
		);
	}
}
