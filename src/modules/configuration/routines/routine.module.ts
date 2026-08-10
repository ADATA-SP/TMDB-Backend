import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';
import { DataCollectionService } from '../../process/data-collection/data-collection.service';

@Module({
	imports: [JwtModule.register({})],
	controllers: [RoutineController],
	providers: [RoutineService, DataCollectionService],
	exports: [RoutineService],
})
export class RoutineModule {}
