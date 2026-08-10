import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	IsIP,
	Matches,
	MaxLength,
	MinLength,
	IsOptional,
} from 'class-validator';

export class CreateMachineDto {
	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Descrição da máquina. De 3 a 100 caracteres.',
		example: 'Máquina de Inspeção Visual 01',
	})
	@IsNotEmpty({ message: 'A descrição não pode estar vazia.' })
	@IsString()
	@MinLength(3, { message: 'A descrição deve ter no mínimo 3 caracteres.' })
	@MaxLength(100, {
		message: 'A descrição deve ter no máximo 100 caracteres.',
	})
	description: string;

	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Código único da máquina. Aceita letras, números, hífens e underscores.',
		example: 'B017',
	})
	@IsNotEmpty({ message: 'O código não pode estar vazio.' })
	@IsString()
	@Matches(/^[A-Za-z0-9_-]+$/, {
		message:
			'O código deve conter apenas letras, números, hífens ou underscores.',
	})
	code: string;

	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Endereço IP da máquina.',
		example: '192.168.0.10',
	})
	@IsNotEmpty({ message: 'O endereço IP não pode estar vazio.' })
	@IsIP(undefined, { message: 'Endereço IP inválido.' })
	ip_address: string;

	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Porta de comunicação, de 2 a 5 dígitos.',
		example: '9100',
	})
	@IsNotEmpty({ message: 'A porta não pode estar vazia.' })
	@IsString()
	@Matches(/^\d{2,5}$/, {
		message: 'A porta deve conter entre 2 e 5 dígitos numéricos.',
	})
	port_address: string;

	@ApiProperty({
		required: true,
		type: 'string',
		default: '',
		description: 'Tipo da máquina.',
		example: 'Automatic Visual Inspection',
	})
	@IsNotEmpty({ message: 'O tipo da máquina não pode estar vazio.' })
	@IsString()
	machine_type?: string;

	@ApiProperty({
		required: false,
		type: 'string',
		default: '',
		description: 'Localização da máquina na planta.',
		example: 'AI Backend',
	})
	@IsOptional()
	@IsString()
	localization?: string;
}
