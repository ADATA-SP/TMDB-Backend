import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';
import { MachineMesStatus } from '../../../../common/enums/machine-mes-status.enum';

export class CreateRoutineDto {
	@ApiProperty({
		required: true,
		type: 'number',
		description: 'Identificador da máquina à qual a rotina pertence.',
		example: 1,
	})
	@IsNotEmpty({ message: 'Campo machine_id não pode estar vazio' })
	@Transform(({ value }) => Number(value))
	@IsInt()
	machine_id: number;

	@ApiProperty({
		required: false,
		type: 'number',
		description: 'Intervalo em segundos entre a execução de cada ação.',
		example: 5,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt()
	delay_execution?: number;

	@ApiProperty({
		required: true,
		type: 'string',
		enum: MachineMesStatus,
		description: 'Estado da máquina no MES que dispara a rotina.',
		example: 'RUN',
	})
	@IsEnum(MachineMesStatus, {
		message: 'status deve ser RUN (RUN), SETUP (SETUP) ou PL (PL)',
	})
	type: MachineMesStatus;

	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Descrição da rotina.',
		example: 'Rotina de partida da máquina',
	})
	@IsString()
	description: string;

	@ApiProperty({
		required: false,
		type: 'array',
		description: 'Códigos de motivo associados à rotina.',
		example: ['R001', 'R002'],
	})
	@IsOptional()
	@IsArray()
	reason_codes?: string[];
}
