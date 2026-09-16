import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginateInputDto } from '../../../../common/dto/paginate-input.dto';

export class ListOutputAuditDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador do registro.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Entidade alterada.',
		example: 'Máquina',
	})
	type: string;

	@ApiProperty({
		type: 'string',
		description: 'Descrição do registro alterado.',
		example: 'Máquina de Inspeção Visual 01',
	})
	description: string;

	@ApiProperty({
		type: 'string',
		description: 'Operação realizada.',
		example: 'Atualização',
	})
	operation: string;

	@ApiProperty({
		type: 'number',
		description: 'Identificador do usuário responsável.',
		example: 1,
	})
	user_id: number;

	@ApiProperty({
		description: 'Usuário responsável pela alteração.',
		example: { name: 'Administrador' },
	})
	users: { name: string };

	@ApiProperty({
		type: 'string',
		format: 'date-time',
		description: 'Data em que a alteração foi registrada.',
		example: '2026-09-15T13:00:00.000Z',
	})
	created_at: Date;

	@ApiProperty({
		type: 'string',
		format: 'date-time',
		description: 'Data da última atualização do registro.',
		example: '2026-09-15T13:00:00.000Z',
	})
	updated_at: Date;
}

export class ListInputAuditLogDto extends PaginateInputDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description:
			'Filtra os registros cuja descrição contenha o texto informado.',
		example: 'Inspeção',
	})
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description:
			'Data inicial do período. Formato: YYYY-MM-DD ou YYYY-MM-DDTHH:mm',
		example: '2026-09-01',
	})
	@IsOptional()
	@IsString()
	start?: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description:
			'Data final do período. Formato: YYYY-MM-DD ou YYYY-MM-DDTHH:mm',
		example: '2026-09-15',
	})
	@IsOptional()
	@IsString()
	end?: string;
}
