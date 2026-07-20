import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { PrismaModule } from './database/prisma.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { QueueMailModule } from './common/queue/mail/queue-mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';
import { UsersModule } from './modules/users/users.module';
import { LdapModule } from './ldap/ldap.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		QueueMailModule,
		MailerModule.forRoot({
			transport: {
				host: process.env.MAIL_HOST,
				secure: false,
				port: Number(process.env.MAIL_PORT),
				...(process.env.MAIL_REQUIRED_AUTH == 'true' && {
					auth: {
						user: process.env.MAIL_AUTH_USER,
						pass: process.env.MAIL_AUTH_PASS,
					},
				}),
				tls: {
					rejectUnauthorized: false,
				},
			},
			template: {
				dir: join(__dirname + '/common/templates'),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
		}),
		EventEmitterModule.forRoot({
			wildcard: true,
			maxListeners: 10,
		}),

		PrismaModule,
		AuthenticationModule,
		UsersModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: AtGuard,
		},
	],
})
export class AppModule {}
