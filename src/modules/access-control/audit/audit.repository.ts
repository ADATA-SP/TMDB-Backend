import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma as PrismaType } from '.prisma/client';

@Injectable()
export class AuditLogRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async createMany(
		data: PrismaType.audit_logCreateManyInput,
		trx?: PrismaType.TransactionClient,
	) {
		const prismaClient = trx ?? this.prismaService;

		return prismaClient.audit_log.createMany({ data });
	}
}
