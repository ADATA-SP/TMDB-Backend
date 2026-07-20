// use apenas para paginar dados externos que não possuem paginacao!!!
import { ApiProperty } from '@nestjs/swagger';

export class QueryPaginationDto {
	@ApiProperty({
		required: false,
		description: 'Número da página',
		default: 1,
	})
	page: number;

	@ApiProperty({
		required: false,
		description: 'Número por página',
		default: 8,
	})
	offset: number;
}
