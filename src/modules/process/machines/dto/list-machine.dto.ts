import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginateInputDto } from '../../../../common/dto/paginate-input.dto';

export class ListOutputMachineDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador da máquina.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Descrição da máquina.',
		example: 'Máquina de Inspeção Visual 01',
	})
	description: string;

	@ApiProperty({
		type: 'string',
		description: 'Código único da máquina.',
		example: 'B017',
	})
	code: string;

	@ApiProperty({
		type: 'string',
		description: 'Endereço IP da máquina.',
		example: '192.168.0.10',
	})
	ip_address: string;

	@ApiProperty({
		type: 'string',
		description: 'Porta de comunicação.',
		example: '9100',
	})
	port_address: string;

	@ApiProperty({
		type: 'number',
		description: 'Situação da máquina: 1 para ativa e 0 para inativa.',
		example: 1,
	})
	status: number;

	@ApiProperty({
		type: 'string',
		description: 'Tipo da máquina.',
		example: 'Automatic Visual Inspection',
	})
	machine_type: string;

	@ApiProperty({
		type: 'string',
		description: 'Localização da máquina na planta.',
		example: 'AI Backend',
	})
	localization: string;

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

export class ListInputMachineDto extends PaginateInputDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description:
			'Filtra as máquinas cuja descrição contenha o texto informado.',
		example: 'Inspeção',
	})
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description:
			'Filtra as máquinas cujo código contenha o texto informado.',
		example: 'B017',
	})
	@IsOptional()
	@IsString()
	code: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Filtra pelo tipo exato da máquina.',
		example: 'Automatic Visual Inspection',
	})
	@IsOptional()
	@IsString()
	machine_type: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Filtra pela localização exata da máquina.',
		example: 'AI Backend',
	})
	@IsOptional()
	@IsString()
	localization: string;

	@ApiProperty({
		required: false,
		type: 'boolean',
		default: true,
		description:
			'Filtra máquina pelo estado, true para ativo ou false para inativo',
		example: true,
	})
	@IsBoolean({
		message: 'O campo status deve ser um valor booleano (true ou false).',
	})
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	status?: boolean;
}
