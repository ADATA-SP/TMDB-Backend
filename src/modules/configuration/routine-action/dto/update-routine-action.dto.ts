import { PartialType } from '@nestjs/swagger';
import { CreateRoutineActionDto } from './create-routine-action.dto';

export class UpdateRoutineActionDto extends PartialType(
	CreateRoutineActionDto,
) {}
