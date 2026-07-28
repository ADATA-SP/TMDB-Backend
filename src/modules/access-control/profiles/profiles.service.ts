import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import {
	ListInputProfileDto,
	ListOutputProfileDto,
} from './dto/list-profile.dto';
import { PrismaService } from '../../../database/prisma.service';
import { createPaginator } from 'prisma-pagination';
import { Prisma as PrismaType } from '.prisma/client';
import { UserPayloadProps } from '../../../common/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuditLogRepository } from '../audit/audit.repository';
import { NotificationRepository } from '../notification/notification.repository';

@Injectable()
export class ProfilesService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly auditLogRepository: AuditLogRepository,
		private readonly notificationRepository: NotificationRepository,
	) {}

	async create(createProfileDto: CreateProfileDto) {
		const profileExists = await this.prismaService.profiles.findFirst({
			where: { identifier: createProfileDto.identifer },
		});

		if (profileExists)
			throw new BadRequestException({
				message: 'Já existe um perfil com esse identificador',
			});

		return this.prismaService.profiles.createMany({
			data: {
				identifier: createProfileDto.identifer,
				description: createProfileDto.description,
			},
		});
	}

	async findAll(listInputProfileDto: ListInputProfileDto) {
		const { description, offset, page } = listInputProfileDto;
		let whereClause: PrismaType.profilesWhereInput = {};

		const paginate = createPaginator({
			page: page,
			perPage: offset,
		});

		if (description)
			whereClause = {
				...whereClause,
				description: { contains: description },
			};

		return paginate<ListOutputProfileDto, PrismaType.profilesFindManyArgs>(
			this.prismaService.profiles,
			{
				where: {
					...whereClause,
				},
				orderBy: {
					created_at: 'desc',
				},
			},
		);
	}

	async findOne(id: number) {
		const profileExists = await this.prismaService.profiles.findFirst({
			where: { id },
		});

		if (!profileExists)
			throw new NotFoundException({
				message: 'Perfil  não encontrado!',
			});

		return profileExists;
	}

	async changeStatus(profile_id: number) {
		const profileExists = await this.prismaService.profiles.findFirst({
			where: { id: profile_id },
		});

		if (!profileExists)
			throw new BadRequestException({
				message: 'Perfil não encontrado.',
			});

		return {
			...(await this.prismaService.profiles.updateMany({
				data: {
					status: profileExists.status ? 0 : 1,
					updated_at: new Date(),
				},
				where: { id: profile_id },
			})),
			message: profileExists?.status
				? 'Perfil desabilitado com sucesso!'
				: 'Perfil habilitado com sucesso!',
		};
	}

	async update(
		updateProfileDto: UpdateProfileDto,
		profile_id: number,
		currentUser: UserPayloadProps,
	) {
		const profileExists = await this.prismaService.profiles.findFirst({
			where: { id: profile_id },
		});

		if (!profileExists)
			throw new BadRequestException({
				message: 'Perfil  já encontrado.',
			});

		const validateIdentifier = await this.prismaService.profiles.findFirst({
			where: {
				identifier: updateProfileDto.identifer,
				NOT: {
					id: profile_id,
				},
			},
		});

		if (validateIdentifier)
			throw new BadRequestException({
				message: 'Já existe um perfil com esse identificador.',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await this.notificationRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						type: 'Perfil',
						description: 'Atualização de cadastro',
					},
					trx,
				);

				await this.auditLogRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						description: updateProfileDto.description,
						operation: 'Atualização',
						type: 'Perfil',
					},
					trx,
				);

				return trx.profiles.updateMany({
					data: {
						description: updateProfileDto.description,
						identifier: updateProfileDto.identifer,
						updated_at: new Date(),
					},
					where: { id: profileExists.id },
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Perfil atualizado com sucesso!',
		};
	}

	async delete(profile_id: number, currentUser: UserPayloadProps) {
		const profileExists = await this.prismaService.profiles.findFirst({
			where: { id: profile_id },
			select: {
				id: true,
				_count: {
					select: {
						profile_operation: true,
						users: true,
					},
				},
			},
		});

		if (!profileExists)
			throw new BadRequestException({
				message: 'Perfil não encontrado.',
			});

		if (
			profileExists._count?.profile_operation ||
			profileExists._count?.users
		)
			throw new BadRequestException({
				message: 'Este perfil já está sendo usado.',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await this.notificationRepository.createMany(
					{
						user_id: Number(currentUser.sub),
						type: 'Perfil',
						description: 'Exclusão de cadastro',
					},
					trx,
				);

				return trx.profiles.delete({
					where: { id: profileExists.id },
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Perfil removido com sucesso!',
		};
	}
}
