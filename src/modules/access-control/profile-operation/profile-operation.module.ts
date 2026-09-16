import { Module } from '@nestjs/common';
import { ProfileOperationController } from './profile-operation.controller';
import { ProfileOperationService } from './profile-operation.service';

@Module({
	controllers: [ProfileOperationController],
	providers: [ProfileOperationService],
})
export class ProfileOperationModule {}
