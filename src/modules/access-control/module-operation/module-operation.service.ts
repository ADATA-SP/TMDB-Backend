import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ModuleOperationService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll() {
		return this.prismaService.modules.findMany({
			where: { status: 1 },
			include: { operations: true },
		});
	}
}
