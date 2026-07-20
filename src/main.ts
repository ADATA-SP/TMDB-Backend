import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { defaultErrorValidatorMessage } from './common/message/validation-error';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Enable static assets
	app.useStaticAssets(join(__dirname, '..', 'assets'));

	// cors configuration
	app.enableCors({
		origin: process.env.CORS_ORIGIN,
		methods: process.env.CORS_METHODS,
		preflightContinue: process.env.CORS_PREFLIGHT === 'true' ? true : false,
		optionsSuccessStatus: parseInt(process.env.CORS_SUSS_STATUS),
	});

	// class-validator configuration
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			exceptionFactory: (errors: ValidationError[]) => {
				return defaultErrorValidatorMessage(errors);
			},
			stopAtFirstError: true,
		}),
	);

	// swagger configuration
	const configSwaggerParams = new DocumentBuilder()
		.setTitle(process.env.SWAGGER_TITLE)
		.setDescription(process.env.SWAGGER_DESCRIPTION)
		.setVersion(process.env.SWAGGER_VERSION)
		.addServer(process.env.SWAGGER_API_URL)
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

	const document = SwaggerModule.createDocument(app, configSwaggerParams);

	SwaggerModule.setup(process.env.SWAGGER_ENDPOINT, app, document, {
		swaggerOptions: {
			tagsSorter: 'alpha',
			operationsSorter: 'alpha',
		},
	});

	// app port config
	await app.listen(process.env.APP_PORT);
}

bootstrap();
