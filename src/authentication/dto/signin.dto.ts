import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, NotContains } from 'class-validator';

export class SignInDto {
	@ApiProperty({
		required: true,
		type: 'string',
		description: 'Nome de conta do usuário cadastrado no TMDB.',
		example: 'admin',
	})
	@IsNotEmpty({
		message: 'Campo username não pode estar vazio',
	})
	@NotContains(' ', { message: 'Campo username contém espaços em branco.' })
	username: string;

	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Senha do usuário. Quando connect_ldap for true, corresponde à senha do domínio.',
		example: 'admin',
	})
	@IsNotEmpty({
		message: 'Campo password não pode estar vazio',
	})
	@IsString()
	password: string;

	@ApiProperty({
		required: true,
		type: 'boolean',
		default: false,
		description:
			'Define a origem da validação da senha: true valida no LDAP, false valida na base local.',
		example: false,
	})
	@IsBoolean({
		message:
			'O campo connect_ldap deve ser um valor booleano (true ou false).',
	})
	connect_ldap: boolean;
}
