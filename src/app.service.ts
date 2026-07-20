import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getInfo() {
		return { message: 'RMS2 Adata', env: process.env.DATABASE_URL };
	}
}
