import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateProfileOperationDto } from './dto/create-profile-operation.dto';

@Injectable()
export class ProfileOperationService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll() {
		return this.prismaService.profiles.findMany({
			where: { status: 1 },
			include: {
				profile_operation: {
					select: {
						operations: {
							select: {
								id: true,
								description: true,
								identifier: true,
								module_id: true,
							},
						},
					},
				},
			},
		});
	}

	async create(createProfileOperationDto: CreateProfileOperationDto[]) {
		await this.prismaService
			.$transaction(async (trx) => {
				for (const profileOp of createProfileOperationDto) {
					const { identifier, operations } = profileOp;

					const findProfile = await trx.profiles.findFirst({
						where: { identifier },
					});

					if (findProfile) {
						await trx.profile_operation.deleteMany({
							where: { profile_id: findProfile.id },
						});

						for (const op of operations) {
							const findOperation =
								await trx.operations.findFirst({
									where: { identifier: op },
								});

							if (findOperation)
								await trx.profile_operation.create({
									data: {
										profile_id: findProfile.id,
										operation_id: findOperation.id,
									},
								});
						}
					}
				}
			})
			.catch(() => {
				throw new BadRequestException({
					message: 'Ocorreu um erro ao atualizar permissoes',
				});
			});

		return {
			message: 'Permissoes atualizadas com sucesso!',
		};
	}
}
