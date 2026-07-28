import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../../database/prisma.service';
import { LdapService } from '../../ldap/ldap.service';
import { SearchAccountNameDto } from './dto/search-user.dto';
import { UsersRepository } from './users.repository';
import { ListInputUserDto, ListOutputUserDto } from './dto/list-user.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma as PrismaType } from '.prisma/client';
import { ChangePasswordUserDto } from './dto/change-password-user.dto';
import { hashData } from '../../common/functions';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPayloadProps } from '../../common/types';

@Injectable()
export class UsersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly ldapService: LdapService,
		private readonly usersRepository: UsersRepository,
	) {}

	async create(createUserDto: CreateUserDto, _currentUser: UserPayloadProps) {
		// const userValidationLdap = await this.ldapService.searchUsers({
		// 	identifier: createUserDto.username,
		// });

		const userExists = await this.usersRepository.findByUsername(
			createUserDto.username,
		);

		if (userExists)
			throw new BadRequestException({ message: 'Usuário já cadastrado' });

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				let data: PrismaType.usersCreateManyInput = {
					name: createUserDto.name,
					username: createUserDto.username,
					email: createUserDto.email,
					// ldap_crendential: userValidationLdap?.length > 0 ? 1 : 0,
					ldap_crendential: 0,
				};

				if (createUserDto.password)
					data = {
						...data,
						password: await hashData(createUserDto.password),
					};

				return trx.users.createMany({ data: data });
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Usuário criado com sucesso!',
		};
	}

	async update(
		updateUserDto: UpdateUserDto,
		user_id: number,
		_currentUser: UserPayloadProps,
	) {
		const userExists = await this.prismaService.users.findFirst({
			where: { id: user_id },
		});

		if (!userExists)
			throw new BadRequestException({
				message: 'Usuário  não encontrado.',
			});

		const emailExists = await this.prismaService.users.findFirst({
			where: { email: updateUserDto.email },
		});

		if (emailExists && emailExists.id != user_id)
			throw new BadRequestException({
				message: 'E-mail de usuário já cadastrado',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				let data: PrismaType.usersCreateManyInput = {
					name: updateUserDto.name,
					email: updateUserDto.email,
					updated_at: new Date(),
				};

				if (updateUserDto?.password)
					data = {
						...data,
						password: await hashData(updateUserDto.password),
					};

				return trx.users.updateMany({
					data: data,
					where: { id: user_id },
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Usuário atualizado com sucesso!',
		};
	}

	async delete(user_id: number, currentUser: UserPayloadProps) {
		if (user_id == +currentUser.sub)
			throw new BadRequestException(
				'não é possível excluir o próprio usuário que está logado.',
			);

		const userExists = await this.prismaService.users.findFirst({
			where: { id: user_id },
		});

		if (!userExists)
			throw new BadRequestException({
				message: 'Usuário  não encontrado.',
			});

		return {
			message: 'Usuário removido com sucesso.',
		};
	}

	async changeStatus(user_id: number) {
		const userExists = await this.prismaService.users.findFirst({
			where: { id: user_id },
		});

		if (!userExists)
			throw new BadRequestException({
				message: 'Usuário  não encontrado.',
			});

		return {
			...(await this.prismaService.users.updateMany({
				data: {
					status: userExists.status ? 0 : 1,
					updated_at: new Date(),
				},
				where: { id: user_id },
			})),
			message: userExists?.status
				? 'Usuário desativado com sucesso!'
				: 'Usuário ativado com sucesso!',
		};
	}

	async findAll(listInputUserDto: ListInputUserDto) {
		const { name, offset, page, active } = listInputUserDto;
		let whereClause: PrismaType.usersWhereInput = {};

		const paginate = createPaginator({
			perPage: offset,
			page: page,
		});

		if (name) whereClause = { ...whereClause, name: { contains: name } };

		if (active?.toString()) {
			whereClause = {
				...whereClause,
				status: +listInputUserDto.active ? 1 : 0,
			};
		}

		return paginate<ListOutputUserDto, PrismaType.usersFindManyArgs>(
			this.prismaService.users,
			{
				select: {
					id: true,
					name: true,
					username: true,
					email: true,
					status: true,
					ldap_crendential: true,
				},
				where: { ...whereClause },
				orderBy: {
					created_at: 'desc',
				},
			},
		);
	}

	async findOne(id: number) {
		return this.prismaService.users.findFirst({
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				status: true,
				ldap_crendential: true,
			},
			where: { id },
		});
	}

	async searchAccountName(searchAccountNameDto: SearchAccountNameDto) {
		return this.ldapService.searchUsers(searchAccountNameDto);
	}

	async changePassword(changePasswordDto: ChangePasswordUserDto) {
		const validateUser = await this.usersRepository.findByUsername(
			changePasswordDto.username,
		);

		if (!validateUser)
			throw new NotFoundException({
				message: 'Usuário  não identificado no TMDB',
			});

		const encryptPassword = await hashData(changePasswordDto.password);

		await this.prismaService.users.update({
			data: { password: encryptPassword },
			where: { id: validateUser.id },
		});

		return {
			message: 'Senha do usuário alterada com sucesso!',
		};
	}
}
