import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';
import { PasswordConfirm } from '../../../common/validators';

export class ChangePasswordUserDto {
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
		default: '123456',
		required: true,
		type: 'string',
	})
	@IsNotEmpty({
		message: 'Campo  não pode estar vazio!',
	})
	@IsString()
	@PasswordConfirm('password', {
		message: 'A confirmação de senha  não é igual',
	})
	confirmPassword: string;

	@ApiProperty({
		default: '123456',
		required: true,
		type: 'string',
	})
	@IsNotEmpty({
		message: 'Campo não pode estar vazio!',
	})
	@IsString()
	password: string;
}
