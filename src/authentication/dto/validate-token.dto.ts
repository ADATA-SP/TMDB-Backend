import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class AuthValidateTokenDto {
	@ApiProperty({
		required: true,
		type: 'string',
	})
	@IsNotEmpty({
		message: 'Campo token não pode estar vazio',
	})
	token: string;
}
