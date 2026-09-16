import { Module } from '@nestjs/common';
import { AuditLogRepository } from './audit.repository';
import { AuditLogController } from './audit.controller';
import { AuditLogService } from './audit.service';
import { PdfService } from '../../../common/services/pdf';
import { ExcelService } from '../../../common/services';

@Module({
	controllers: [AuditLogController],
	providers: [AuditLogService, AuditLogRepository, PdfService, ExcelService],
})
export class AuditLogModule {}
