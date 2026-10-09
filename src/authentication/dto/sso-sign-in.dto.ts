import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SsoSignInDto {
	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Código de uso único emitido pelo Portal ADATA e recebido pela bridge do front via portal:sso:init.',
		example: '3f1c9a0e6b2d4c7f8e5a1b2c3d4e5f60',
	})
	@IsNotEmpty({ message: 'Campo sso_code não pode estar vazio' })
	@IsString()
	sso_code: string;

	@ApiProperty({
		required: true,
		type: 'number',
		description: 'Identificador do TMDB no cadastro de sistemas do Portal.',
		example: 1,
	})
	@IsInt({ message: 'O campo system_id deve ser um número inteiro.' })
	system_id: number;

	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Valor de state recebido pela bridge na URL aberta pelo Portal.',
		example: '8c5e1c2a-6f0b-4a1e-9d7c-2b3a4c5d6e7f',
	})
	@IsNotEmpty({ message: 'Campo state não pode estar vazio' })
	@IsString()
	state: string;

	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Nonce gerado pela bridge e enviado ao Portal em portal:sso:ready.',
		example: '0b7d3f7e-2c1a-4e8f-a9b6-5d4c3b2a1f0e',
	})
	@IsNotEmpty({ message: 'Campo client_nonce não pode estar vazio' })
	@IsString()
	client_nonce: string;
}
