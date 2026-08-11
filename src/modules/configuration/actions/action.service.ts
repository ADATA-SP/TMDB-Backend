import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma as PrismaType } from '.prisma/client';
import { CreateActionDto } from './dto/create-action.dto';
import { ListInputActionDto } from './dto/list-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@Injectable()
export class ActionService {
	constructor(private readonly prismaService: PrismaService) {}

	async create(createActionDto: CreateActionDto) {
		const actionExists = await this.prismaService.actions.findFirst({
			where: {
				name: createActionDto.name,
				description: createActionDto.description,
			},
		});

		if (actionExists)
			throw new BadRequestException({
				message: 'Já existe uma ação com esse nome e descrição.',
			});

		return this.prismaService.actions.createMany({
			data: {
				description: createActionDto.description,
				command: JSON.stringify(createActionDto.command),
				name: createActionDto.name,
				machine_type: createActionDto.machine_type,
			},
		});
	}

	async findAll(listInputActionDto: ListInputActionDto) {
		const { description, machine_type } = listInputActionDto;
		let whereClause: PrismaType.actionsWhereInput = {};

		if (description)
			whereClause = {
				...whereClause,
				description: { contains: description },
			};

		if (machine_type)
			whereClause = {
				...whereClause,
				machine_type: machine_type,
			};

		return this.prismaService.actions.findMany({
			where: { ...whereClause },
		});
	}

	async findOne(id: number) {
		const actionExists = await this.prismaService.actions.findFirst({
			where: { id },
		});

		if (!actionExists)
			throw new NotFoundException({
				message: 'Ação não encontrada!',
			});

		return actionExists;
	}

	async update(updateActionDto: UpdateActionDto, action_id: number) {
		const actionExists = await this.prismaService.actions.findFirst({
			where: { id: action_id },
		});

		if (!actionExists)
			throw new BadRequestException({
				message: 'Ação  não encontrada.',
			});

		await this.prismaService.actions.updateMany({
			data: {
				name: updateActionDto.name,
				command: JSON.stringify(updateActionDto.command),
				description: updateActionDto.description,
				machine_type: updateActionDto.machine_type,
			},
			where: { id: actionExists.id },
		});

		return {
			message: 'Ação atualizada com sucesso!',
		};
	}

	async delete(action_id: number) {
		const actionExists = await this.prismaService.actions.findFirst({
			where: { id: action_id },
		});

		if (!actionExists)
			throw new BadRequestException({
				message: 'Ação  não encontrada.',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await trx.routine_action.deleteMany({ where: { action_id } });
				return trx.actions.delete({
					where: { id: actionExists.id },
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Ação removida com sucesso!',
		};
	}
}
