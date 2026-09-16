import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateActionDto {
	@ApiProperty({
		required: false,
		type: 'string',
		description:
			'Comando enviado à máquina, em JSON. É armazenado serializado.',
		example: '{"command":"START","parameter1":"","parameter2":""}',
	})
	@IsString()
	command: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Descrição da ação.',
		example: 'Inicia a execução da máquina',
	})
	@IsString()
	description: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Nome da ação.',
		example: 'Start',
	})
	@IsString()
	name: string;

	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Tipo de máquina ao qual a ação se aplica.',
		example: 'Automatic Visual Inspection',
	})
	@IsString()
	machine_type: string;
}
