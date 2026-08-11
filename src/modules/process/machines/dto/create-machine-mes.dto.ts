import {
	IsString,
	IsNotEmpty,
	ValidateNested,
	IsArray,
	IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ItemDto {
	@ApiProperty({ description: 'Código da máquina no MES.', example: 'B017' })
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiProperty({
		description: 'Descrição da máquina.',
		example: 'Machine - B017',
	})
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty({
		description: 'Localização da máquina na planta.',
		example: 'AI Backend',
	})
	@IsString()
	@IsNotEmpty()
	location: string;

	@ApiProperty({
		description: 'Tipo da máquina.',
		example: 'Automatic Visual Inspection',
	})
	@IsString()
	@IsNotEmpty()
	type: string;

	@ApiProperty({
		required: false,
		type: 'number',
		default: 1,
		description: 'Situação da máquina: 1 para ativa e 0 para inativa.',
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	status?: number;
}

export class CreateMachineListDto {
	@ApiProperty({
		type: [ItemDto],
		description: 'Lista de máquinas a serem importadas',
		example: [
			{
				code: 'B017',
				description: 'Machine - B017',
				location: 'AI Backend',
				type: 'Automatic Visual Inspection',
				status: 1,
			},
			{
				code: 'B018',
				description: 'Machine - B018',
				location: 'AI Frontend',
				type: 'Manual Visual Inspection',
				status: 0,
			},
		],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ItemDto)
	items: ItemDto[];
}
