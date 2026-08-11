import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListOutputActionDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador da ação.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Descrição da ação.',
		example: 'Inicia a execução da máquina',
	})
	description: string;

	@ApiProperty({
		type: 'string',
		description: 'Comando serializado enviado à máquina.',
		example: '{"command":"START","parameter1":"","parameter2":""}',
	})
	command: string;

	@ApiProperty({
		type: 'string',
		description: 'Nome da ação.',
		example: 'Start',
	})
	name: string;

	@ApiProperty({
		type: 'string',
		description: 'Tipo de máquina ao qual a ação se aplica.',
		example: 'Automatic Visual Inspection',
	})
	machine_type: string;
}

export class ListInputActionDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description:
			'Filtra as ações cuja descrição contenha o texto informado.',
		example: 'Inicia',
	})
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Filtra pelo tipo exato de máquina.',
		example: 'Automatic Visual Inspection',
	})
	@IsOptional()
	@IsString()
	machine_type?: string;
}
