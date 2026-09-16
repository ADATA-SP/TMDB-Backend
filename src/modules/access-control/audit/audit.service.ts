import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { createPaginator } from 'prisma-pagination';
import { Prisma as PrismaType } from '@prisma/client';
import {
	ListInputAuditLogDto,
	ListOutputAuditDto,
} from './dto/list-audit-log.dto';
import { Response } from 'express';
import { PdfService } from '../../../common/services/pdf';
import { formatShortDate } from '../../../common/functions/format-date.function';
import { findManyAuditQuery } from '../../../utils/prisma/prisma-audit-log.utils';
import { ExcelService } from '../../../common/services';
import { ExportDto } from '../../../common/dto/list-file.dto';
import { buildDateWhereClause } from '../../../common/functions/date-filter.function';

@Injectable()
export class AuditLogService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly pdfService: PdfService,
		private readonly excelService: ExcelService,
	) {}

	async findAll(listInputAuditLogDto: ListInputAuditLogDto) {
		const { offset, page, description, start, end } = listInputAuditLogDto;
		let whereClause: PrismaType.audit_logWhereInput = {};

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

		return paginate<ListOutputAuditDto, PrismaType.audit_logFindManyArgs>(
			this.prismaService.audit_log,
			{
				...findManyAuditQuery(whereClause),
				orderBy: { created_at: 'desc' },
			},
		);
	}

	async report(res: Response, exportDto: ExportDto) {
		const auditLog = await this.prismaService.audit_log.findMany({
			...findManyAuditQuery(),
			orderBy: {
				created_at: 'desc',
			},
		});

		const columns = [
			{ label: 'Tipo', column: 'type' },
			{ label: 'Descrição', column: 'description' },
			{ label: 'Operação', column: 'operation' },
			{ label: 'Usuário', column: 'username' },
			{ label: 'Data - Hora', column: 'created_at' },
		];

		const pdfData = auditLog?.map((item) => ({
			type: item?.type,
			description: item?.description,
			operation: item?.operation,
			username: item?.users?.name,
			created_at: formatShortDate(item?.created_at.toString()),
		}));

		if (exportDto.type == 'pdf')
			return this.pdfService.generateDynamicTablePDF(
				res,
				columns,
				pdfData,
				{
					filename: 'download_report_audit',
					title: 'Registro de Alterações',
				},
			);

		return this.excelService.generateExcel(
			res,
			pdfData,
			'Registro de Alterações',
			columns,
		);
	}
}
