import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const AuthToken = createParamDecorator(
	(data: undefined, context: ExecutionContext): string => {
		const request = context.switchToHttp().getRequest();
		return request?.headers?.authorization?.split(' ')[1] || null;
	},
);
