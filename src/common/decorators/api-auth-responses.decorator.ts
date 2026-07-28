import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const ApiAuthResponses = () =>
	applyDecorators(
		ApiUnauthorizedResponse({
			description: 'Token ausente, inválido ou expirado.',
			schema: {
				example: {
					statusCode: 401,
					message: 'Unauthorized',
				},
			},
		}),
		ApiForbiddenResponse({
			description:
				'Usuário autenticado, porém sem a permissão exigida pela rota.',
			schema: {
				example: {
					statusCode: 403,
					message: 'O usuário não tem as permissões necessárias.',
					error: 'Forbidden',
				},
			},
		}),
	);
