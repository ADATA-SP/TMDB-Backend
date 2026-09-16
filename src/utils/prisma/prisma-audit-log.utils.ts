import { Prisma as PrismaType } from '.prisma/client';

export function findManyAuditQuery(
	whereClause: PrismaType.audit_logWhereInput = {},
) {
	return {
		include: { users: { select: { name: true } } },
		where: { ...whereClause },
	};
}
