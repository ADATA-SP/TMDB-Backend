import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateReasonCodeDto {
	@ApiProperty({
		required: false,
		type: 'string',
		description: 'Código de motivo informado pelo MES.',
		example: 'R001',
	})
	@IsString()
	code: string;
}
