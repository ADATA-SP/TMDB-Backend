import { Module } from '@nestjs/common';
import { ToolingsController } from './toolings.controller';
import { ToolingsService } from './toolings.service';
import { AuditLogRepository } from '../../access-control/audit/audit.repository';
import { NotificationRepository } from '../../access-control/notification/notification.repository';
import { MesSystemService } from '../mes-system/mes-system.service';

@Module({
	controllers: [ToolingsController],
	providers: [
		ToolingsService,
		MesSystemService,
		AuditLogRepository,
		NotificationRepository,
	],
})
export class ToolingsModule {}
