import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ListOutputRoutineActionDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador da rotina.',
		example: 1,
	})
	routine_id: number;

	@ApiProperty({
		type: 'number',
		description: 'Identificador da ação.',
		example: 1,
	})
	action_id: number;

	@ApiProperty({
		type: 'number',
		description: 'Ordem de execução da ação dentro da rotina.',
		example: 1,
	})
	position: number;
}

export class ListInputRoutineActionDto {
	@ApiProperty({
		required: false,
		type: 'number',
		description: 'Filtra os vínculos de uma rotina específica.',
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	routine_id: number;
}
