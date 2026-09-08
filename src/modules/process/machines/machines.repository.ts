import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class MachinesRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByCode(code: string) {
		return this.prismaService.machines.findFirst({
			where: { code, is_blocked: 0 },
		});
	}
}
