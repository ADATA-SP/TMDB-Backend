import { BadRequestException, ValidationError } from '@nestjs/common';

export const defaultErrorValidatorMessage = (errors: ValidationError[]) => {
	const firstError = errors[0];

	const defineMessage = firstError.constraints
		? firstError.constraints[Object.keys(firstError.constraints)[0]]
		: firstError.children[0].constraints
			? firstError.children[0].constraints[
					Object.keys(firstError.children[0].constraints)[0]
				]
			: 'Error no formulário';

	const result = {
		property: firstError.property,

		message: defineMessage,

		statusCode: 400,

		error: 'Bad Request',
	};

	return new BadRequestException(result);
};
