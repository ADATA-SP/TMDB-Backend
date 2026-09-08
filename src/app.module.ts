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
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/access-control/profiles/profiles.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MachinesModule } from './modules/process/machines/machines.module';
import { RoutineModule } from './modules/configuration/routines/routine.module';
import { ActionModule } from './modules/configuration/actions/action.module';
import { RoutineActionModule } from './modules/configuration/routine-action/routine-action.module';
import { ReasonCodeModule } from './modules/configuration/reason-code/reason-code.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ThrottlerModule.forRoot([
			{
				name: 'short',
				ttl: 1000,
				limit: 20,
			},
			{
				name: 'long',
				ttl: 60000,
				limit: 300,
			},
		]),
		QueueMailModule,
		MailerModule.forRoot({
			transport: {
				host: process.env.MAIL_HOST,
				secure: process.env.MAIL_SECURE === 'true',
				port: Number(process.env.MAIL_PORT),
				...(process.env.MAIL_REQUIRED_AUTH == 'true' && {
					auth: {
						user: process.env.MAIL_AUTH_USER,
						pass: process.env.MAIL_AUTH_PASS,
					},
				}),
				tls: {
					rejectUnauthorized:
						process.env.MAIL_TLS_ENABLE === 'true' &&
						process.env.NODE_ENV === 'production',
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
		ProfilesModule,
		MachinesModule,
		RoutineModule,
		ActionModule,
		RoutineActionModule,
		ReasonCodeModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: AtGuard,
		},
	],
})
export class AppModule {}
