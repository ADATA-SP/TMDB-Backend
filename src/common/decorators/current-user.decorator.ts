import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserPayloadProps } from '../types/user.type';

export const GetCurrentUser = createParamDecorator(
	(data: undefined, context: ExecutionContext): UserPayloadProps => {
		const request = context.switchToHttp().getRequest();
		return request.user;
	},
);
