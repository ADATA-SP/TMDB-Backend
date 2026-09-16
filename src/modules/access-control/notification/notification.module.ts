import { Module } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PdfService } from '../../../common/services/pdf';
import { ExcelService } from '../../../common/services';

@Module({
	controllers: [NotificationController],
	providers: [
		NotificationService,
		NotificationRepository,
		PdfService,
		ExcelService,
	],
})
export class NotificationModule {}
