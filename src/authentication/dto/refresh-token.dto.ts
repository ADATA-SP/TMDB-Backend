import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
	@ApiProperty({ required: true, type: 'string' })
	refreshToken: string;
}
