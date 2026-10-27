import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginateInputDto } from '../../../../common/dto/paginate-input.dto';
import { ToolingStatus } from '../../../../common/enums/toolings.enum';

export class ListOutputToolingDto {
	@ApiProperty({
		type: 'number',
		description:
			'Identificador do serial do tooling no MES (TOOLING_SN_ID).',
		example: 10000816,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Serial do tooling no MES (TOOLING_SN).',
		example: '05_08_2021 X 4',
	})
	tooling_sn: string;

	@ApiProperty({
		type: 'number',
		description: 'Identificador do modelo do tooling no MES (TOOLING_ID).',
		example: 10105,
	})
	tooling_id: number;

	@ApiProperty({
		type: 'string',
		description: 'Código MES do modelo do tooling (TOOLING_NO).',
		example: 'Etool_4needle_8mm_r0.25mm',
	})
	code: string;

	@ApiProperty({
		type: 'string',
		description: 'Nome do tooling (TOOLING_NAME).',
		example: 'Etool_4needle_8mm_r0.25mm',
	})
	name: string;

	@ApiProperty({
		type: 'string',
		description: 'Tipo do tooling (TOOLING_TYPE).',
		example: 'E. Needle',
	})
	type: string;

	@ApiProperty({
		type: 'string',
		description: 'Descrição do tooling (TOOLING_DESC).',
		example: 'Etool_4needle_8mm_r0.25mm',
	})
	description: string;

	@ApiProperty({
		type: 'string',
		nullable: true,
		description:
			'Código da máquina em que o tooling está montado no MES. Nulo quando disponível.',
		example: 'DA01',
	})
	machine_code: string | null;

	@ApiProperty({
		type: 'string',
		enum: ['LINKED', 'AVAILABLE'],
		description:
			'Situação do tooling no MES: LINKED quando montado em máquina, AVAILABLE caso contrário.',
		example: 'LINKED',
	})
	mes_status: 'LINKED' | 'AVAILABLE';

	@ApiProperty({
		type: 'number',
		description: 'Total de usos do serial (USED_COUNT / TOTAL_USED_COUNT).',
		example: 5741,
	})
	total_used: number;

	@ApiProperty({
		type: 'number',
		nullable: true,
		description:
			'Quantidade máxima de usos (STS_MAX_USED_COUNT do serial ou MAX_USED_COUNT do modelo).',
		example: 7200,
	})
	max_used_count: number | null;

	@ApiProperty({
		type: 'number',
		nullable: true,
		description:
			'Limite de usos (STS_LIMIT_USED_COUNT do serial ou LIMIT_USED_COUNT do modelo).',
		example: 9000,
	})
	limit_used_count: number | null;

	@ApiProperty({
		type: 'string',
		nullable: true,
		description: 'Data Matrix vinculado ao tooling no TMDB.',
		example: 'DMX-000124',
	})
	datamatrix: string | null;

	@ApiProperty({
		enum: ToolingStatus,
		description:
			'LINKED quando há Data Matrix vinculado no TMDB, UNLINKED caso contrário.',
		example: ToolingStatus.LINKED,
	})
	status: ToolingStatus;
}

export class ListInputToolingDto extends PaginateInputDto {
	@ApiProperty({
		required: false,
		type: 'number',
		description:
			'Filtra os toolings montados na máquina informada (identificador do TMDB).',
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt({ message: 'A máquina deve ser um identificador numérico.' })
	machine_id?: number;

	@ApiProperty({
		required: false,
		type: 'string',
		description:
			'Filtra os toolings cujo nome, tipo ou serial contenham o texto informado.',
		example: 'Needle',
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Filtra pelo nome exato do tooling.',
		example: 'Etool_4needle_8mm_r0.25mm',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({
		required: false,
		enum: ToolingStatus,
		description: 'Filtra pela situação do vínculo com o Data Matrix.',
		example: ToolingStatus.LINKED,
	})
	@IsOptional()
	@IsEnum(ToolingStatus, {
		message: 'O status deve ser LINKED ou UNLINKED.',
	})
	status?: ToolingStatus;
}

export class ToolingMachineInputDto {
	@ApiProperty({
		required: false,
		type: 'number',
		description:
			'Restringe aos toolings montados na máquina informada (identificador do TMDB).',
		example: 1,
	})
	@IsOptional()
	@Transform(({ value }) => Number(value))
	@IsInt({ message: 'A máquina deve ser um identificador numérico.' })
	machine_id?: number;
}

export class FindByDatamatrixInputDto {
	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Data Matrix a ser pesquisado.',
		example: 'DMX-000124',
	})
	@Transform(({ value }) =>
		typeof value === 'string' ? value.trim() : value,
	)
	@IsString()
	datamatrix: string;
}

export class ListAvailableToolingDto {
	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Filtra pelo tipo exato do tooling.',
		example: 'E. Needle',
	})
	@IsOptional()
	@IsString()
	type?: string;
}
