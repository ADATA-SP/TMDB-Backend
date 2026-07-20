import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		required: true,
		type: 'string',
	})
	@IsNotEmpty({
		message: 'Campo nome não pode estar vazio',
	})
	@MinLength(3, { message: 'Campo nome requer no mínimo 3 caracteres!' })
	@MaxLength(200, { message: 'Campo nome requer no máximo 200 caracteres!' })
	@IsString()
	@Matches(/^\S.*\S$/, {
		message: 'O Nome não pode começar ou terminar com espaços em branco..',
	})

	/*
	@Matches(/^[a-zA-ZÀ-ÿçÇ]+(\s+[a-zA-ZÀ-ÿçÇ]+)*$/, {
		message:
			"O campo nome deve conter caracteres alfabéticos, incluindo acentuação e 'ç _'",
	})
	*/
	name: string;

	@ApiProperty({
		required: true,
		type: 'string',
	})
	@IsNotEmpty({
		message: 'Campo username não pode estar vazio',
	})
	@MinLength(3, { message: 'Campo username requer no mínimo 3 caracteres!' })
	@MaxLength(100, {
		message: 'Campo username requer no máximo 100 caracteres!',
	})
	@IsString()
	@Matches(/^\S.*\S$/, {
		message:
			'O campo username não pode começar ou terminar com espaços em branco.',
	})
	username: string;

	@ApiProperty({
		required: false,
		type: 'string',
	})
	@IsOptional()
	@IsString()
	@IsEmail({}, { message: 'E-mail inválido!' })
	email?: string;

	@ApiProperty({
		required: true,
		default: 1,
		type: 'number',
	})
	@IsNotEmpty({
		message: 'Campo profile_id não pode estar vazio',
	})
	@Transform(({ value }) => {
		return Number(value);
	})
	profile_id: number;

	@ApiProperty({
		required: false,
		type: 'string',
	})
	@IsOptional()
	@IsString()
	password?: string;
}
