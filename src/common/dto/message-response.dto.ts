import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
	@ApiProperty({
		type: 'string',
		description: 'Mensagem de confirmação da operação.',
		example: 'Operação realizada com sucesso!',
	})
	message: string;
}

export class CountMessageResponseDto extends MessageResponseDto {
	@ApiProperty({
		type: 'number',
		description: 'Quantidade de registros afetados.',
		example: 1,
	})
	count: number;
}
