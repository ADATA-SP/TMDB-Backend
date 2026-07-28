import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginateInputDto } from '../../../common/dto/paginate-input.dto';

export class ListOutputUserDto {
	@ApiProperty({
		type: 'number',
		description: 'Identificador do usuário.',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: 'string',
		description: 'Nome completo do usuário.',
		example: 'Usuário Exemplo',
	})
	name: string;

	@ApiProperty({
		type: 'string',
		description: 'Nome de conta utilizado no login.',
		example: 'usuario.exemplo',
	})
	username: string;

	@ApiProperty({
		type: 'string',
		description: 'Endereço de e-mail do usuário.',
		example: 'user@exemplo.com',
	})
	email: string;

	@ApiProperty({
		type: 'number',
		description: 'Situação do usuário: 1 para ativo e 0 para inativo.',
		example: 1,
	})
	status: number;

	@ApiProperty({
		type: 'number',
		description:
			'Indica se o usuário possui credencial no LDAP: 1 para sim e 0 para não.',
		example: 0,
	})
	ldap_crendential: number;
}

export class ListInputUserDto extends PaginateInputDto {
	@ApiProperty({
		default: '',
		required: false,
		type: 'string',
		description: 'Filtra os usuários cujo nome contenha o texto informado.',
		example: 'Usuário',
	})
	@IsOptional()
	@IsString()
	name: string;

	@ApiProperty({
		required: true,
		type: 'boolean',
		default: true,
		description:
			'Filtra usuário pelo status, true para ativo ou false para inativo',
		example: true,
	})
	@IsBoolean({
		message: 'O campo active deve ser um valor booleano (true ou false).',
	})
	@Transform(({ value }) => value === 'true' || value === true)
	active: boolean;
}
