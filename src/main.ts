import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { defaultErrorValidatorMessage } from './common/message/validation-error';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { validateEnv } from './common/functions/validate-env.function';

async function bootstrap() {
	validateEnv();

	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	const logger = new Logger('Bootstrap');
	const isProduction = process.env.NODE_ENV === 'production';

	app.use(
		helmet({
			contentSecurityPolicy: isProduction ? undefined : false,
			crossOriginEmbedderPolicy: false,
		}),
	);

	app.disable('x-powered-by');

	// Enable static assets
	app.useStaticAssets(join(__dirname, '..', 'assets'));

	// cors configuration
	app.enableCors({
		origin:
			process.env.CORS_ORIGIN === '*'
				? '*'
				: process.env.CORS_ORIGIN?.split(',').map((origin) =>
						origin.trim(),
					),
		methods: process.env.CORS_METHODS,
		preflightContinue: process.env.CORS_PREFLIGHT === 'true' ? true : false,
		optionsSuccessStatus: parseInt(process.env.CORS_SUSS_STATUS),
	});

	// class-validator configuration
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			exceptionFactory: (errors: ValidationError[]) => {
				return defaultErrorValidatorMessage(errors);
			},
			stopAtFirstError: true,
		}),
	);

	app.enableShutdownHooks();

	// swagger configuration
	const configSwaggerParams = new DocumentBuilder()
		.setTitle(process.env.SWAGGER_TITLE)
		.setDescription(process.env.SWAGGER_DESCRIPTION)
		.setVersion(process.env.SWAGGER_VERSION)
		.addServer(process.env.SWAGGER_API_URL)
		.addTag(
			'Health',
			'Verificação de disponibilidade da aplicação. Rota pública.',
		)
		.addTag(
			'Authentication',
			'Emissão de tokens e consulta do usuário autenticado.',
		)
		.addTag('Users', 'Cadastro de usuários e integração com o LDAP.')
		.addTag('Profiles', 'Cadastro dos perfis de acesso.')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Enter JWT token',
				in: 'header',
			},
			'JWT-auth',
		)
		.build();

	if (process.env.SWAGGER_ENABLED !== 'false') {
		const document = SwaggerModule.createDocument(app, configSwaggerParams);

		SwaggerModule.setup(process.env.SWAGGER_ENDPOINT, app, document, {
			swaggerOptions: {
				tagsSorter: 'alpha',
				operationsSorter: 'alpha',
				persistAuthorization: true,
				displayRequestDuration: true,
				docExpansion: 'none',
				filter: true,
			},
		});
	}

	// app port config
	await app.listen(process.env.APP_PORT);

	logger.log(`Aplicação disponível na porta ${process.env.APP_PORT}`);
}

bootstrap();
