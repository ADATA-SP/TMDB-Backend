import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getInfo() {
		return {
			name: process.env.SWAGGER_TITLE,
			version: process.env.APP_VERSION,
			environment: process.env.APP_ENV,
			status: 'ok',
		};
	}
}
