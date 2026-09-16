import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CreateProfileOperationDto {
	@ApiProperty({
		example: 'admin',
		description:
			'Identificador do perfil que terá as permissões definidas.',
	})
	@IsString({ message: 'identifier deve ser uma string' })
	identifier: string;

	@ApiProperty({
		example: ['show-users', 'edit-users', 'show-machines'],
		description:
			'Identificadores das operações liberadas para o perfil. A lista substitui integralmente as permissões atuais.',
		isArray: true,
		type: String,
	})
	@IsArray({ message: 'operations deve ser um array' })
	@ArrayNotEmpty({ message: 'operations não pode ser vazio' })
	@IsString({ each: true, message: 'cada operação deve ser uma string' })
	operations: string[];
}
