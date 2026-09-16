import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ListOutputRoutineDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador da rotina.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Estado da máquina no MES que dispara a rotina.',
		example: 'RUN',
	})
	type: string;

	@ApiProperty({
		type: 'number',
		description: 'Identificador da máquina à qual a rotina pertence.',
		example: 1,
	})
	machine_id: number;
}

export class ListInputRoutineDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description: 'Filtra pelo estado exato que dispara a rotina.',
		example: 'RUN',
	})
	@IsOptional()
	@IsString()
	type: string;

	@ApiProperty({
		required: false,
		default: 1,
		type: 'number',
		description: 'Filtra as rotinas de uma máquina específica.',
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return Number(value);
	})
	@IsInt()
	machine_id?: number;
}
