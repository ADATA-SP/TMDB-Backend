import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma as PrismaType } from '.prisma/client';

@Injectable()
export class NotificationRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async createMany(
		data: PrismaType.notification_logCreateManyInput,
		trx?: PrismaType.TransactionClient,
	) {
		const prismaClient = trx ?? this.prismaService;

		return prismaClient.notification_log.createMany({ data });
	}
}
