import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
	model: TModel,
) => {
	return applyDecorators(
		ApiExtraModels(model),
		ApiOkResponse({
			description: 'Lista paginada de registros.',
			schema: {
				title: `PaginatedResponseOf${model.name}`,
				allOf: [
					{
						properties: {
							data: {
								type: 'array',
								description: 'Registros da página atual.',
								items: { $ref: getSchemaPath(model) },
							},
						},
					},
					{
						properties: {
							meta: {
								type: 'object',
								description: 'Metadados da paginação.',
								properties: {
									total: {
										type: 'number',
										description:
											'Total de registros encontrados.',
										example: 42,
									},
									lastPage: {
										type: 'number',
										description: 'Número da última página.',
										example: 6,
									},
									currentPage: {
										type: 'number',
										description: 'Página atual.',
										example: 1,
									},
									perPage: {
										type: 'number',
										description: 'Registros por página.',
										example: 8,
									},
									prev: {
										type: 'number',
										nullable: true,
										description:
											'Página anterior, ou null quando não houver.',
										example: null,
									},
									next: {
										type: 'number',
										nullable: true,
										description:
											'Próxima página, ou null quando não houver.',
										example: 2,
									},
								},
							},
						},
					},
				],
			},
		}),
	);
};
