import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchAccountNameDto {
	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Nome de conta a ser pesquisado no diretório LDAP (sAMAccountName).',
		example: 'usuario.exemplo',
	})
	@IsString()
	@MinLength(3, {
		message: 'O campo username requer no mínimo 3 caracteres!',
	})
	@MaxLength(100, {
		message: 'O campo username requer no máximo 100 caracteres!',
	})
	identifier: string;
}
