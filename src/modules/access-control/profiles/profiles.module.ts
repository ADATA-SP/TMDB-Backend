import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { AuditLogRepository } from '../audit/audit.repository';
import { NotificationRepository } from '../notification/notification.repository';

@Module({
	controllers: [ProfilesController],
	providers: [ProfilesService, AuditLogRepository, NotificationRepository],
})
export class ProfilesModule {}
