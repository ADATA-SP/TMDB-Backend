import {
	CanActivate,
	ExecutionContext,
	mixin,
	Type,
	ForbiddenException,
} from '@nestjs/common';
import { isArray } from 'class-validator';

export function PermissionGuard(permission: any): Type<CanActivate> {
	class PermissionGuardMixin implements CanActivate {
		async canActivate(context: ExecutionContext) {
			const request = context.switchToHttp().getRequest<any>();

			// if (request?.user?.profile == 'admin') {
			// 	return true;
			// }

			const operations = request?.user?.operations;

			if (isArray(permission)) {
				if (
					operations?.some((operation: number) =>
						permission?.includes(operation),
					)
				) {
					return true;
				} else {
					throw new ForbiddenException(
						'O usuário não tem as permissões necessárias.',
					);
				}
			}

			if (operations?.includes(permission)) {
				return true;
			} else {
				throw new ForbiddenException(
					'O usuário não tem as permissões necessárias.',
				);
			}
		}
	}

	return mixin(PermissionGuardMixin);
}
