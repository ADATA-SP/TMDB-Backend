// src/user/user.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByUsername(username: string) {
		return this.prismaService.users.findFirst({
			where: { username },
		});
	}
}
