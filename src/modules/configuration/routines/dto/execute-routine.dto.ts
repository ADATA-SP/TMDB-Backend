import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ExecuteRoutineDto {
	@ApiProperty({
		required: true,
		type: 'number',
		description: 'Identificador da rotina a ser executada.',
		example: 1,
	})
	@IsNotEmpty({ message: 'Routine id nao pode estar vazio' })
	@Transform(({ value }) => {
		return Number(value);
	})
	routine_id: number;

	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Código da máquina que receberá os comandos.',
		example: 'B017',
	})
	@IsNotEmpty({ message: 'Machine code nao pode estar vazio' })
	code: string;

	@ApiProperty({
		required: false,
		type: 'number',
		description: 'Intervalo em segundos entre a execução de cada ação.',
		example: 5,
	})
	@IsOptional()
	delay_execution?: number;
}
