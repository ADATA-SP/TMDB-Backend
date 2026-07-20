import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginateInputDto } from 'src/common/dto/paginate-input.dto';

export class ListOutputUserDto {
	id: number;
	name: string;
	username: string;
	email: string;
	status: string;
}

export class ListInputUserDto extends PaginateInputDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
	})
	@IsOptional()
	@IsString()
	name: string;

	@ApiProperty({
		required: true,
		type: 'boolean',
		default: true,
		description:
			'Filtra usuário pelo status, true para ativo ou false para inativo',
	})
	@IsBoolean({
		message: 'O campo active deve ser um valor booleano (true ou false).',
	})
	@Transform(({ value }) => value === 'true' || value === true)
	active: boolean;
}
