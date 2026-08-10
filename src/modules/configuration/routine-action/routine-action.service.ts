import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma as PrismaType } from '.prisma/client';
import { CreateRoutineActionDto } from './dto/create-routine-action.dto';
import { ListInputRoutineActionDto } from './dto/list-routine-action.dto';

@Injectable()
export class RoutineActionService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createRoutineActionDto: CreateRoutineActionDto) {
		const routineActionExists = await this.prismaService.routines.findFirst(
			{
				where: {
					id: +createRoutineActionDto.routine_id,
				},
			},
		);

		if (!routineActionExists)
			throw new NotFoundException({
				message: 'Rotina não encontrada',
			});

		await this.prismaService.$transaction(
			async (trx: PrismaType.TransactionClient) => {
				await trx.routines.update({
					where: {
						id: routineActionExists.id,
					},
					data: {
						ignore_recipe_validation:
							createRoutineActionDto.ignore_recipe_validation,
						validate_recipe_success:
							createRoutineActionDto.validate_recipe_success,
					},
				});

				await trx.routine_action.deleteMany({
					where: { routine_id: routineActionExists.id },
				});

				for (const action of createRoutineActionDto.actions) {
					const actionExists = await trx.actions.findFirst({
						where: {
							id: +action.id,
						},
					});

					if (actionExists?.id)
						await trx.routine_action.create({
							data: {
								routine_id: routineActionExists.id,
								position: action.position,
								action_id: actionExists.id,
							},
						});
				}
			},
		);

		return {
			message: 'Rotina atualizada com sucesso',
		};
	}

	async findAll(listInputRoutineActionDto: ListInputRoutineActionDto) {
		const { routine_id } = listInputRoutineActionDto;
		let whereClause: PrismaType.routine_actionWhereInput = {};

		if (routine_id)
			whereClause = {
				...whereClause,
				routine_id: +routine_id,
			};

		return this.prismaService.routine_action.findMany({
			where: { ...whereClause },
		});
	}

	async findOne(routine_id: number) {
		const routineActionExists =
			await this.prismaService.routine_action.findFirst({
				where: { routine_id },
			});

		if (!routineActionExists)
			throw new NotFoundException({
				message: 'Rotina não encontrada!',
			});

		return routineActionExists;
	}
}
