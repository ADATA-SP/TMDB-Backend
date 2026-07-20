import { JwtService } from '@nestjs/jwt';
import { AuthUserProps } from '../../authentication/types';

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

export default async function signToken(
	user: AuthUserProps,
	expiresIn: string = '1h',
	secret = process.env.JWT_AT_SECRET,
	jwtService: JwtService,
) {
	return jwtService.signAsync(
		{
			sub: user.id,
			username: user.username || undefined,
			email: user?.email,
			name: user?.name,
			status: user?.status,
			profile_id: user?.profile_id,
			profile_identifier: user?.profile_identifier,
			operations: user?.operations,
		},
		{
			secret: secret,
			expiresIn: doExpiresIn(expiresIn),
		},
	);
}
