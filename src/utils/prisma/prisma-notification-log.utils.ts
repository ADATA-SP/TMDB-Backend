import { Prisma as PrismaType } from '.prisma/client';

export function findManyNotificationQuery(
	whereClause: PrismaType.notification_logWhereInput = {},
) {
	return {
		include: { users: { select: { name: true } } },
		where: { ...whereClause },
	};
}
