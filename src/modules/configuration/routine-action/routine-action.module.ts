import { Module } from '@nestjs/common';
import { RoutineActionController } from './routine-action.controller';
import { RoutineActionService } from './routine-action.service';

@Module({
	controllers: [RoutineActionController],
	providers: [RoutineActionService],
})
export class RoutineActionModule {}
