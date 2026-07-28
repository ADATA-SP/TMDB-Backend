import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginateInputDto } from '../../../../common/dto/paginate-input.dto';

export class ListOutputProfileDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador do perfil.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Nome descritivo do perfil.',
		example: 'Administrador',
	})
	description: string;

	@ApiProperty({
		type: 'string',
		description: 'Chave única utilizada para identificar o perfil.',
		example: 'admin',
	})
	identifier: string;

	@ApiProperty({
		type: 'number',
		description: 'Indica se o perfil é externo: 1 para sim e 0 para não.',
		example: 1,
	})
	external: number;

	@ApiProperty({
		type: 'number',
		description: 'Situação do perfil: 1 para ativo e 0 para inativo.',
		example: 1,
	})
	status: number;

	@ApiProperty({
		type: 'string',
		format: 'date-time',
		description: 'Data de criação do registro.',
		example: '2026-07-28T16:30:00.000Z',
	})
	created_at: Date;

	@ApiProperty({
		type: 'string',
		format: 'date-time',
		description: 'Data da última atualização do registro.',
		example: '2026-07-28T16:30:00.000Z',
	})
	updated_at: Date;
}

export class ListInputProfileDto extends PaginateInputDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description:
			'Filtra os perfis cuja descrição contenha o texto informado.',
		example: 'Administrador',
	})
	@IsOptional()
	@IsString()
	description: string;
}
