import { Module } from '@nestjs/common';
import { ModuleOperationController } from './module-operation.controller';
import { ModuleOperationService } from './module-operation.service';

@Module({
	controllers: [ModuleOperationController],
	providers: [ModuleOperationService],
})
export class ModuleOperationModule {}
