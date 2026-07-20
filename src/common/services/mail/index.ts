import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { resolve, join } from 'path';

@Injectable()
export class EmailService {
	constructor(private mailerService: MailerService) {}

	async send(email: string, subject: string, message, template?: string) {
		if (!template || template === null) {
			template = 'default';
		}

		if (typeof message === 'string') {
			message = {
				text: message,
			};
		}

		return this.mailerService.sendMail({
			to: email,
			from: process.env.MAIL_FROM,
			subject: subject,
			text: 'TMDB-2',
			template: `${template}.template.hbs`,
			context: {
				...message,
				imageCid1: 'image1@cid',
				imageCid2: 'image2@cid',
				imageCid3: 'image3@cid',
				imageCid4: 'image4@cid',
			},
			attachments: [
				{
					filename: 'image-1.png',
					path: resolve(
						join(
							__dirname,
							'..',
							'..',
							'templates/assets',
							'image-1.png',
						),
					),
					cid: 'image1@cid',
				},
				{
					filename: 'image-2.png',
					path: resolve(
						join(
							__dirname,
							'..',
							'..',
							'templates/assets',
							'image-2.png',
						),
					),
					cid: 'image2@cid',
				},
				{
					filename: 'image-3.png',
					path: resolve(
						join(
							__dirname,
							'..',
							'..',
							'templates/assets',
							'image-3.png',
						),
					),
					cid: 'image3@cid',
				},
				{
					filename: 'image-4.png',
					path: resolve(
						join(
							__dirname,
							'..',
							'..',
							'templates/assets',
							'image-4.png',
						),
					),
					cid: 'image4@cid',
				},
			],
		});
	}
}
