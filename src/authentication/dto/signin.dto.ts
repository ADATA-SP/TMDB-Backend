import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, NotContains } from 'class-validator';

export class SignInDto {
	@ApiProperty({
		required: true,
		type: 'string',
	})
	@IsNotEmpty({
		message: 'Campo username não pode estar vazio',
	})
	@NotContains(' ', { message: 'Campo username contém espaços em branco.' })
	username: string;

	@ApiProperty({
		required: true,
		type: 'string',
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
		description: 'Define se deve conectar no LDAP. true ou false',
	})
	@IsBoolean({
		message:
			'O campo connect_ldap deve ser um valor booleano (true ou false).',
	})
	connect_ldap: boolean;
}
