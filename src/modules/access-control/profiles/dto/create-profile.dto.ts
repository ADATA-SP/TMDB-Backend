import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateProfileDto {
	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Nome descritivo do perfil. De 3 a 30 caracteres, aceitando apenas letras e espaços.',
		example: 'Administrador',
	})
	@IsNotEmpty({
		message: 'Campo description não pode estar vazio',
	})
	@MinLength(3, { message: 'Campo nome requer no mínimo 3 caracteres!' })
	@MaxLength(30, { message: 'Campo nome requer no máximo 100 caracteres!' })
	@IsString()
	@Matches(/^\S.*\S$/, {
		message:
			'O campo description não pode começar ou terminar com espaços em branco..',
	})
	@Matches(/^[a-zA-ZÀ-ÿçÇ]+(\s+[a-zA-ZÀ-ÿçÇ]+)*$/, {
		message:
			"O campo description deve conter caracteres alfabéticos, incluindo acentuação e 'ç'",
	})
	description: string;

	@ApiProperty({
		required: true,
		type: 'string',
		description:
			'Chave única de identificação do perfil. De 3 a 80 caracteres.',
		example: 'admin',
	})
	@IsNotEmpty({
		message: 'Campo identifier não pode estar vazio',
	})
	@MinLength(3, {
		message: 'Campo identifier requer no mínimo 3 caracteres!',
	})
	@MaxLength(80, {
		message: 'Campo identifier requer no máximo 100 caracteres!',
	})
	@IsString()
	@Matches(/^\S.*\S$/, {
		message:
			'O campo identifier não pode começar ou terminar com espaços em branco.',
	})
	identifer: string;
}
