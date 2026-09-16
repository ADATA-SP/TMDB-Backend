import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoutineActionDto {
	@ApiProperty({
		description: 'Identificador da rotina.',
		example: '1',
	})
	@IsNotEmpty({ message: 'Campo routine_id não pode estar vazio' })
	routine_id: string;

	@ApiProperty({
		description:
			'Define se a rotina só é executada quando a validação da receita for bem-sucedida.',
		type: Boolean,
		required: false,
		example: true,
	})
	@IsOptional()
	@Transform(({ value }) => (value === true || value === 'true' ? 1 : 0))
	@IsInt()
	validate_recipe_success?: number;

	@ApiProperty({
		description: 'Ignora a validação de receita ao executar a rotina.',
		type: Boolean,
		required: false,
		example: false,
	})
	@IsOptional()
	@Transform(({ value }) => (value === true || value === 'true' ? 1 : null))
	@IsInt()
	ignore_recipe_validation?: number;

	@ApiProperty({
		description:
			'Ações da rotina e sua ordem de execução. Substitui integralmente os vínculos existentes.',
		isArray: true,
		example: [
			{ id: 1, position: 1 },
			{ id: 2, position: 2 },
		],
	})
	@IsOptional()
	@IsArray({ message: 'actions deve ser um array' })
	actions?: { id: number; position: number }[];
}
