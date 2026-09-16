import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListOutputReasonCodeDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador do código de motivo.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'number',
		description:
			'Indica se o código é ignorado na validação: 1 para sim e 0 para não.',
		example: 1,
	})
	ignored: number;

	@ApiProperty({
		type: 'string',
		description: 'Código de motivo.',
		example: 'R001',
	})
	code: string;

	@ApiProperty({
		type: 'number',
		description: 'Rotina à qual o código está associado.',
		example: 1,
	})
	routine_id: number;
}

export class ListInputReasonCodeDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description: 'Filtra os códigos que contenham o texto informado.',
		example: 'R00',
	})
	@IsOptional()
	@IsString()
	code: string;
}
