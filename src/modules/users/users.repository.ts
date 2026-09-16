import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByUsername(username: string) {
		return this.prismaService.users.findFirst({
			where: { username },
			include: {
				profiles: {
					include: {
						profile_operation: { include: { operations: true } },
					},
				},
			},
		});
	}
}
