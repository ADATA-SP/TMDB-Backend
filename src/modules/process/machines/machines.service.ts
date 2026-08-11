import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { createPaginator } from 'prisma-pagination';
import { Prisma as PrismaType } from '.prisma/client';

import { MachinesRepository } from './machines.repository';
import {
	ListInputMachineDto,
	ListOutputMachineDto,
} from './dto/list-machine.dto';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { UserPayloadProps } from '../../../common/types';
import { AuditLogRepository } from '../../access-control/audit/audit.repository';
import { NotificationRepository } from '../../access-control/notification/notification.repository';
import { paginationData } from '../../../common/functions/pagination-data.function';
import { machineData } from '../../../common/mocks/machines';
import { QueryPaginationDto } from '../../../common/dto/pagination-data.dto';
import { CreateMachineListDto } from './dto/create-machine-mes.dto';
import { MesSystemService } from '../mes-system/mes-system.service';

@Injectable()
export class MachinesService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly machineRepository: MachinesRepository,
		private readonly auditLogRepository: AuditLogRepository,
		private readonly notificationRepository: NotificationRepository,
		private readonly mesSystemService: MesSystemService,
	) {}

	async create(
		createMachineDto: CreateMachineDto,
		currentUser: UserPayloadProps,
	) {
		const machineExists = await this.machineRepository.findByCode(
			createMachineDto.code,
		);

		if (machineExists)
			throw new BadRequestException({ message: 'Máquina já cadastrada' });

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await this.notificationRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						type: 'Máquina',
						description: 'Cadastro de máquina',
					},
					trx,
				);

				await this.auditLogRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						description: createMachineDto.description,
						operation: 'Cadastro',
						type: 'Máquina',
					},
					trx,
				);

				return trx.machines.createMany({
					data: {
						code: createMachineDto.code,
						description: createMachineDto.description,
						ip_address: createMachineDto.ip_address,
						port_address: createMachineDto.port_address,
						machine_type: createMachineDto.machine_type,
						localization: createMachineDto.localization,
					},
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Máquina criada com sucesso!',
		};
	}

	async update(
		updateMachineDto: UpdateMachineDto,
		machine_id: number,
		currentUser: UserPayloadProps,
	) {
		const machineExists = await this.prismaService.machines.findFirst({
			where: { id: machine_id, is_blocked: 0 },
		});

		if (!machineExists)
			throw new BadRequestException({
				message: 'Máquina  não encontrada.',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await this.notificationRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						type: 'Máquina',
						description: 'Atualização de cadastro',
					},
					trx,
				);

				await this.auditLogRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						description: updateMachineDto.description,
						operation: 'Atualização',
						type: 'Máquina',
					},
					trx,
				);

				return trx.machines.updateMany({
					data: {
						code: updateMachineDto.code,
						description: updateMachineDto.description,
						ip_address: updateMachineDto.ip_address,
						port_address: updateMachineDto.port_address,
						machine_type: updateMachineDto.machine_type,
						localization: updateMachineDto.localization,
						updated_at: new Date(),
					},
					where: { id: machineExists.id },
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Máquina atualizada com sucesso!',
		};
	}

	async delete(machine_id: number, currentUser: UserPayloadProps) {
		const machineExists = await this.prismaService.machines.findFirst({
			where: { id: machine_id },
		});

		if (!machineExists)
			throw new BadRequestException({
				message: 'Máquina  não encontrada.',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await this.notificationRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						type: 'Máquina',
						description: 'Exclusão de cadastro',
					},
					trx,
				);

				await trx.routes.deleteMany({ where: { machine_id } });

				return trx.machines.update({
					where: { id: machineExists.id },
					data: {
						is_blocked: 1,
					},
				});
			})
			.catch((error) => {
				if (error?.code === 'P2003') {
					throw new HttpException(
						'A máquina possui logs vinculados',
						HttpStatus.BAD_REQUEST,
					);
				}

				throw new BadRequestException(error);
			});

		return {
			message: 'Máquina removida com sucesso!',
		};
	}

	async findAll(listInputMachineDto: ListInputMachineDto) {
		const {
			code,
			offset,
			page,
			machine_type,
			localization,
			status,
			description,
		} = listInputMachineDto;
		let whereClause: PrismaType.machinesWhereInput = { is_blocked: 0 };

		const paginate = createPaginator({
			perPage: offset,
			page: page,
		});

		if (code) whereClause = { ...whereClause, code: { contains: code } };

		if (description)
			whereClause = {
				...whereClause,
				description: { contains: description },
			};

		if (machine_type) whereClause = { ...whereClause, machine_type };

		if (localization) whereClause = { ...whereClause, localization };

		if (status?.toString())
			whereClause = {
				...whereClause,
				status: status ? 1 : 0,
			};

		return paginate<ListOutputMachineDto, PrismaType.machinesFindManyArgs>(
			this.prismaService.machines,
			{
				where: { ...whereClause },
				orderBy: {
					created_at: 'desc',
				},
			},
		);
	}

	async findOne(id: number) {
		return this.prismaService.machines.findFirst({
			where: { id, is_blocked: 0 },
		});
	}

	async select() {
		return this.prismaService.machines.findMany({
			where: {
				is_blocked: 0,
			},
			select: {
				id: true,
				code: true,
			},
		});
	}

	async findMes(query: QueryPaginationDto) {
		let transformedData = [];

		if (process.env.ENABLE_MES == 'true') {
			transformedData = await this.mesDataSystem();
		} else {
			transformedData = await this.mesDataLocal();
		}

		return paginationData(transformedData, query);
	}

	private async mesDataLocal() {
		return Promise.all(
			machineData.map(async (machine) => {
				const machineExists =
					await this.prismaService.machines.findFirst({
						where: { code: machine.code, is_blocked: 0 },
					});

				if (machineExists) {
					return {
						...machine,
						ip_address: machineExists.ip_address,
						port: machineExists.port_address,
						status: machineExists.status,
					};
				}

				return {
					...machine,
					ip_address: null,
					port: null,
					status: 0,
				};
			}),
		);
	}

	async mesDataSystem() {
		const machines = await this.mesSystemService.findDataMachine();
		return Promise.all(
			machines.map(async (machine) => {
				const machineExists =
					await this.prismaService.machines.findFirst({
						where: { code: machine.machine_code, is_blocked: 0 },
					});

				if (machineExists) {
					return {
						code: machineExists?.code,
						description: machineExists?.description,
						location: machineExists?.localization,
						type: machineExists?.machine_type,
						ip_address: machineExists?.ip_address,
						port: machineExists?.port_address,
						status: machineExists?.status,
						status_mes: machine?.enabled ? 1 : 0,
					};
				}

				return {
					code: machine?.machine_code,
					description: machine?.machine_desc,
					location: machine?.machine_loc,
					type: machine?.machine_type?.desc,
					ip_address: null,
					port: null,
					status: 0,
					status_mes: machine?.enabled ? 1 : 0,
				};
			}),
		);
	}

	async createMes(createMachineListDto: CreateMachineListDto) {
		await this.prismaService.$transaction(
			async (trx: PrismaType.TransactionClient) => {
				for (const element of createMachineListDto.items) {
					const machineExists = await trx.machines.findFirst({
						where: { code: element.code },
					});

					if (machineExists) {
						await trx.machines.update({
							data: {
								description: element.description,
								machine_type: element.type,
								localization: element.location,
								status: element.status,
								is_blocked: 0,
							},
							where: { id: machineExists.id },
						});
					} else {
						await trx.machines.create({
							data: {
								description: element.description,
								code: element.code,
								machine_type: element.type,
								localization: element.location,
								status: element.status,
							},
						});
					}
				}

				return createMachineListDto.items;
			},
		);

		return {
			message: 'Máquinas sincronizadas com sucesso',
		};
	}

	async changeStatus(machine_id: number) {
		const machineExists = await this.prismaService.machines.findFirst({
			where: { id: machine_id, is_blocked: 0 },
		});

		if (!machineExists)
			throw new BadRequestException({
				message: 'Máquina não encontrada.',
			});

		return {
			...(await this.prismaService.machines.updateMany({
				data: {
					status: machineExists.status ? 0 : 1,
					updated_at: new Date(),
				},
				where: { id: machine_id },
			})),
			message: machineExists?.status
				? 'Máquina desabilitada com sucesso!'
				: 'Máquina habilitada com sucesso!',
		};
	}
}
