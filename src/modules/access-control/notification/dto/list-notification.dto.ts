import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginateInputDto } from '../../../../common/dto/paginate-input.dto';

export class ListOutputNotificationDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador da notificação.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Entidade que originou a notificação.',
		example: 'Máquina',
	})
	type: string;

	@ApiProperty({
		type: 'string',
		description: 'Descrição do evento notificado.',
		example: 'Atualização de cadastro',
	})
	description: string;

	@ApiProperty({
		type: 'string',
		description: 'Código da máquina relacionada, quando houver.',
		example: 'B017',
	})
	machine_code: string;

	@ApiProperty({
		type: 'number',
		description: 'Identificador do usuário notificado.',
		example: 1,
	})
	user_id: number;

	@ApiProperty({
		description: 'Usuário notificado.',
		example: { name: 'Administrador' },
	})
	users: { name: string };

	@ApiProperty({
		type: 'string',
		format: 'date-time',
		description: 'Data em que a notificação foi registrada.',
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

export class ListInputNotificationDto extends PaginateInputDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description:
			'Filtra as notificações cuja descrição contenha o texto informado.',
		example: 'Cadastro',
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
