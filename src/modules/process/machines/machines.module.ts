import { Module } from '@nestjs/common';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';
import { MachinesRepository } from './machines.repository';
import { AuditLogRepository } from '../../access-control/audit/audit.repository';
import { NotificationRepository } from '../../access-control/notification/notification.repository';
import { MesSystemService } from '../mes-system/mes-system.service';
import { MachinesImportService } from './machines-import.service';
import { RmsSystemService } from '../rms-system/rms-system.service';

@Module({
	controllers: [MachinesController],
	providers: [
		MachinesService,
		MachinesRepository,
		AuditLogRepository,
		NotificationRepository,
		MesSystemService,
		MachinesImportService,
		RmsSystemService,
	],
})
export class MachinesModule {}
