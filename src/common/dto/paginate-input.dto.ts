import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class PaginateInputDto {
	@ApiProperty({
		required: true,
		default: 1,
		type: 'number',
		description: 'Page number',
	})
	@IsNotEmpty({
		message: 'Campo  não pode estar vazio!',
	})
	@Transform(({ value }) => Number(value))
	@IsInt()
	page: number;

	@ApiProperty({
		required: true,
		default: 8,
		type: 'number',
		description: 'Number of records per page',
	})
	@Transform(({ value }) => Number(value))
	@IsNotEmpty({
		message: 'Campo  não pode estar vazio!',
	})
	@IsInt()
	offset: number;
}
