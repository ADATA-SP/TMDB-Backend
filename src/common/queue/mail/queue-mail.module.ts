import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { EmailService } from '../../../common/services';
import { QueueEmailProcessor } from './queue-mail.processor';

@Global()
@Module({
	imports: [
		BullModule.registerQueue({
			name: 'email',
		}),
	],
	providers: [EmailService, QueueEmailProcessor],
	exports: [BullModule],
})
export class QueueMailModule {}
