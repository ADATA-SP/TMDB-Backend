import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getInfo() {
		return { message: 'TMDB2 Adata', env: process.env.DATABASE_URL };
	}
}
