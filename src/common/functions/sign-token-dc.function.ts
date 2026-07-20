import { JwtService } from '@nestjs/jwt';

function doExpiresIn(expiresIn: string): number {
	const typeOfTime = expiresIn.match(/(\d{1,3})([hmd])/);

	if (!typeOfTime) {
		throw new Error(
			'Verifique se a variável de ambiente JWT EXPIRES segue o formato: [0-9][h,m,d] por exemplo: 1h, 1m ou 1d.',
		);
	}

	switch (typeOfTime[2]) {
		case 'h':
			return 60 * 60 * parseInt(typeOfTime[1]);
		case 'm':
			return 60 * parseInt(typeOfTime[1]);
		case 'd':
			return 24 * 60 * 60 * parseInt(typeOfTime[1]);
		default:
			throw new Error('Unidade de tempo inválida.');
	}
}

export async function signDcToken(
	apiKey: string,
	jwtService: JwtService,
	expiresIn: string = '24h',
	secret: string = 'mySuperSecretKeyForJWTAuthentication123!',
) {
	const now = Math.floor(Date.now() / 1000);
	const expiration = now + doExpiresIn(expiresIn);

	return jwtService.signAsync(
		{
			sub: apiKey,
			serviceName: 'DC',
			iat: now,
			exp: expiration,
		},
		{
			secret,
			algorithm: 'HS256',
			header: {
				alg: 'HS256',
				typ: 'JWT',
			},
		},
	);
}
