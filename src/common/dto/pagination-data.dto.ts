// use apenas para paginar dados externos que não possuem paginacao!!!
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryPaginationDto {
	@ApiProperty({
		required: false,
		description: 'Número da página',
		default: 1,
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	page: number;

	@ApiProperty({
		required: false,
		description: 'Número por página',
		default: 8,
		example: 8,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	offset: number;
}
