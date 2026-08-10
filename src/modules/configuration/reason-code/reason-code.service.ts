import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma as PrismaType } from '.prisma/client';
import { ListInputReasonCodeDto } from './dto/list-reason-code.dto';
import { UpdateReasonCodeDto } from './dto/update-reason-code.dto';

@Injectable()
export class ReasonCodeService {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll(listInputReasonCodeDto: ListInputReasonCodeDto) {
		const { code } = listInputReasonCodeDto;
		let whereClause: PrismaType.reason_codeWhereInput = {};

		if (code)
			whereClause = {
				...whereClause,
				code: { contains: code },
			};

		return this.prismaService.reason_code.findMany({
			where: { ...whereClause },
		});
	}

	async findOne(id: number) {
		const reasonCodeExists = await this.prismaService.reason_code.findFirst(
			{
				where: { id },
			},
		);

		if (!reasonCodeExists)
			throw new NotFoundException({
				message: 'Reason code não encontrado!',
			});

		return reasonCodeExists;
	}

	async update(
		updateReasonCodeDto: UpdateReasonCodeDto,
		reason_code_id: number,
	) {
		const reasonCodeExists = await this.prismaService.reason_code.findFirst(
			{
				where: { id: reason_code_id },
			},
		);

		if (!reasonCodeExists)
			throw new BadRequestException({
				message: 'Reason code  não encontrado.',
			});

		await this.prismaService.reason_code.updateMany({
			data: {
				code: updateReasonCodeDto.code,
				ignored: +updateReasonCodeDto.ignored,
			},
			where: { id: reasonCodeExists.id },
		});

		return {
			message: 'Reason code atualizado com sucesso!',
		};
	}

	async delete(reason_code: string, routine_id: number) {
		const reasonCodeExists = await this.prismaService.reason_code.findFirst(
			{
				where: { code: reason_code, routine_id: +routine_id },
			},
		);

		if (!reasonCodeExists)
			throw new BadRequestException({
				message: 'Reason code não encontrado.',
			});

		await this.prismaService.reason_code.delete({
			where: { id: reasonCodeExists.id },
		});

		return {
			message: 'Reason code removido com sucesso!',
		};
	}
}
