import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma as PrismaType } from '.prisma/client';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { ListInputRoutineDto } from './dto/list-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { MachineRoutineStatus } from '../../../common/enums/generic-status.enum';
import { MachineMesStatus } from '../../../common/enums/machine-mes-status.enum';
import { ExecuteRoutineDto } from './dto/execute-routine.dto';
import {
	hasKey,
	validateJson,
} from '../../../common/functions/validate-json.function';
import { DataCollectionService } from '../../process/data-collection/data-collection.service';

@Injectable()
export class RoutineService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly dcService: DataCollectionService,
	) {}

	private readonly logger = new Logger(RoutineService.name);

	async create(createRoutineDto: CreateRoutineDto) {
		return this.prismaService.routines.createMany({
			data: {
				type: createRoutineDto.type,
				machine_id: +createRoutineDto.machine_id,
				description: createRoutineDto.description,
				delay_execution: createRoutineDto.delay_execution,
				ignore_recipe_validation: null,
			},
		});
	}

	async findAll(listInputRoutineDto: ListInputRoutineDto) {
		const { type, machine_id } = listInputRoutineDto;
		let whereClause: PrismaType.routinesWhereInput = {};

		if (type)
			whereClause = {
				...whereClause,
				type: type,
			};

		if (machine_id)
			whereClause = {
				...whereClause,
				machine_id: machine_id,
			};

		const routines = await this.prismaService.routines.findMany({
			where: { ...whereClause },
			include: {
				routine_action: {
					include: { actions: true },
				},
				reason_code: {
					select: {
						code: true,
					},
				},
			},
		});

		return routines?.map((routine) => ({
			...routine,
			reason_code: routine.reason_code.map((item) => item.code),
			type_name: MachineRoutineStatus[routine.type],
		}));
	}

	async findOne(id: number) {
		const routineExists = await this.prismaService.routines.findFirst({
			where: { id },
			include: {
				routine_action: {
					include: { actions: true },
				},
			},
		});

		if (!routineExists)
			throw new NotFoundException({
				message: 'Rotina não encontrada!',
			});

		return {
			...routineExists,
			type_name: MachineRoutineStatus[routineExists?.type],
		};
	}

	async findOneByMachineType(id: number) {
		const routineExists = await this.prismaService.routines.findFirst({
			where: { id },
			include: {
				routine_action: {
					include: { actions: true },
				},
			},
		});

		if (!routineExists)
			throw new NotFoundException({
				message: 'Rotina não encontrada!',
			});

		return routineExists;
	}

	async update(updateRoutineDto: UpdateRoutineDto, routine_id: number) {
		const routineExists = await this.prismaService.routines.findFirst({
			where: { id: routine_id },
		});

		if (!routineExists)
			throw new BadRequestException({
				message: 'Rotina  não encontrada.',
			});

		return await this.prismaService.$transaction(async (tx) => {
			const updatedRoutine = await tx.routines.update({
				data: {
					type: updateRoutineDto.type,
					machine_id: +updateRoutineDto.machine_id,
					description: updateRoutineDto.description,
					delay_execution: updateRoutineDto.delay_execution,
				},
				where: { id: routineExists.id },
			});

			if (updateRoutineDto.reason_codes?.length) {
				await tx.reason_code.createMany({
					data: updateRoutineDto.reason_codes.map((reason) => ({
						code: reason,
						routine_id: updatedRoutine.id,
					})),
				});
			}

			return updatedRoutine;
		});
	}

	async delete(routine_id: number) {
		const routineExists = await this.prismaService.routines.findFirst({
			where: { id: routine_id },
		});

		if (!routineExists)
			throw new BadRequestException({
				message: 'Rotina  não encontrada.',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await trx.routine_action.deleteMany({ where: { routine_id } });
				await trx.reason_code.deleteMany({
					where: { routine_id: routine_id },
				});
				return trx.routines.delete({
					where: { id: routineExists.id },
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Rotina removida com sucesso!',
		};
	}

	private ensureObject<T = any>(value: any): T {
		let result = value;

		while (typeof result === 'string') {
			result = JSON.parse(result);
		}

		if (
			typeof result !== 'object' ||
			result === null ||
			Array.isArray(result)
		) {
			throw new Error('Valor final não é um objeto válido');
		}

		return result as T;
	}

	async executeCommand(
		executeRoutineDto: ExecuteRoutineDto,
		signal?: AbortSignal,
	) {
		if (!executeRoutineDto.routine_id) return;

		const machineExists = await this.prismaService.machines.findFirst({
			where: {
				code: executeRoutineDto.code,
			},
		});

		if (!machineExists)
			throw new BadRequestException({
				message: 'Máquina associada a rotina nao encontrada!',
			});

		if (!machineExists.status) return;

		const routineExists = await this.prismaService.routines.findFirst({
			where: {
				id: executeRoutineDto.routine_id,
			},
			include: {
				routine_action: {
					include: { actions: true },
				},
			},
		});

		if (!routineExists)
			throw new BadRequestException({
				message: 'Rotina associda a máquina nao encontrada!',
			});

		const actions = routineExists?.routine_action
			.slice()
			.sort((a, b) => a.position - b.position);

		for (const [idx, action] of actions.entries()) {
			if (signal?.aborted) {
				this.logger.warn(
					`Execução cancelada para máquina ${machineExists.code}`,
				);
				return;
			}

			if (!validateJson(action.actions.command)) continue;

			const command = this.ensureObject(action.actions.command);

			try {
				const sent = !hasKey(command, 'tid')
					? await this.dcService.runCommandMachine({
							...command,
							machine: machineExists.code,
							ip: machineExists.ip_address,
							port: +machineExists.port_address,
						})
					: await this.dcService.runCommandMachineAlarm({
							...command,
							machine: machineExists.code,
							ip: machineExists.ip_address,
							port: +machineExists.port_address,
						});

				if (sent && idx < actions.length - 1) {
					this.logger.debug(
						`Aguardando ${executeRoutineDto.delay_execution}s (ação ${idx + 1}/${actions.length})`,
					);
					await this.abortableSleep(
						executeRoutineDto.delay_execution * 1000,
						signal,
					);
				}
			} catch (error) {
				this.logger.error(
					`Erro ao executar comando da ação ${idx + 1}`,
					error,
				);
			}
		}
	}

	private abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
		return new Promise((resolve) => {
			if (signal?.aborted) return resolve();
			const timer = setTimeout(resolve, ms);
			signal?.addEventListener(
				'abort',
				() => {
					clearTimeout(timer);
					resolve();
				},
				{ once: true },
			);
		});
	}

	getAlltypes() {
		return Object.entries(MachineMesStatus)
			.filter(([key]) => isNaN(Number(key)))
			.map(([key, value]) => ({
				id: key,
				value: value,
			}));
	}
}
