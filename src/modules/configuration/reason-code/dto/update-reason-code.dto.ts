import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateReasonCodeDto } from './create-reason-code.dto';

export class UpdateReasonCodeDto extends PartialType(CreateReasonCodeDto) {
	@ApiProperty({
		required: true,
		type: 'number',
		description:
			'Indica se o código é ignorado na validação: 1 para sim e 0 para não.',
		example: 1,
	})
	@IsNotEmpty({ message: 'Campo ignored não pode estar vazio' })
	@Transform(({ value }) => Number(value))
	@IsInt()
	ignored: number;
}
