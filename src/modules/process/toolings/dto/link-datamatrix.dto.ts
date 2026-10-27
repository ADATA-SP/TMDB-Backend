import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LinkDatamatrixDto {
	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Data Matrix lido do tooling. Até 100 caracteres.',
		example: 'DMX-000124',
	})
	@Transform(({ value }) =>
		typeof value === 'string' ? value.trim() : value,
	)
	@IsNotEmpty({ message: 'O Data Matrix não pode estar vazio.' })
	@IsString()
	@MaxLength(100, {
		message: 'O Data Matrix deve ter no máximo 100 caracteres.',
	})
	datamatrix: string;
}
