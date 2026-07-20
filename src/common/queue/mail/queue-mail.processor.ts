import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from 'src/common/services';

@Processor('email')
export class QueueEmailProcessor {
	constructor(private emailService: EmailService) {}

	@Process()
	async handleEmailJob(job: Job) {
		const { email, subject, message, template } = job.data;

		await this.emailService.send(email, subject, message, template);
	}
}
