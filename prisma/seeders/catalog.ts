import { PrismaClient, Prisma as PrismaType } from '@prisma/client';

export const ADMIN_PROFILE_IDENTIFIER = 'admin';

const modulesDataQuery = [
	{
		description: 'Usuários',
		slug: 'users',
		status: 1,
		operations: [
			{ description: 'Criar Usuários', identifier: 'create' },
			{ description: 'Editar Usuários', identifier: 'edit' },
			{ description: 'Visualizar Usuários', identifier: 'show' },
			{
				description: 'Alerta de alteração de Usuários',
				identifier: 'notify',
			},
			{ description: 'Excluir Usuários', identifier: 'delete' },
		],
	},
	{
		description: 'Máquinas',
		slug: 'machines',
		status: 1,
		operations: [
			{ description: 'Editar Máquina', identifier: 'edit' },
			{ description: 'Excluir Máquina', identifier: 'delete' },
			{ description: 'Visualizar Máquinas', identifier: 'show' },
			{ description: 'Sincronizar Máquinas', identifier: 'sync' },
		],
	},
	{
		description: 'Notificações',
		slug: 'notifications',
		status: 1,
		operations: [
			{ description: 'Visualizar Notificações', identifier: 'show' },
		],
	},
	{
		description: 'Registro de Alterações',
		slug: 'change-log',
		status: 1,
		operations: [
			{
				description: 'Visualizar Registro de Alterações',
				identifier: 'show',
			},
		],
	},
	{
		description: 'Permissões',
		slug: 'permissions',
		status: 1,
		operations: [
			{ description: 'Editar Permissões', identifier: 'edit' },
			{ description: 'Visualizar Permissões', identifier: 'show' },
		],
	},
];

export type CatalogSummary = {
	createdOperations: number;
	createdProfile: boolean;
	linkedOperations: number;
	adminProfileId: number;
};

export async function seedCatalog(
	prisma: PrismaClient,
): Promise<CatalogSummary> {
	return prisma.$transaction(async (trx: PrismaType.TransactionClient) => {
		const createdOperationIds: number[] = [];

		for (const moduleData of modulesDataQuery) {
			const moduleRecord = await trx.modules.upsert({
				where: { slug: moduleData.slug },
				update: {},
				create: {
					description: moduleData.description,
					slug: moduleData.slug,
					status: moduleData.status,
				},
			});

			for (const op of moduleData.operations) {
				const identifier = `${op.identifier}-${moduleData.slug}`;

				const operationExists = await trx.operations.findUnique({
					where: { identifier },
				});

				if (operationExists) continue;

				const operation = await trx.operations.create({
					data: {
						description: op.description,
						identifier,
						module_id: moduleRecord.id,
					},
				});

				createdOperationIds.push(operation.id);
			}
		}

		let adminProfile = await trx.profiles.findUnique({
			where: { identifier: ADMIN_PROFILE_IDENTIFIER },
		});

		const createdProfile = !adminProfile;

		if (!adminProfile)
			adminProfile = await trx.profiles.create({
				data: {
					identifier: ADMIN_PROFILE_IDENTIFIER,
					description: 'Administrador',
					external: 1,
					status: 1,
				},
			});

		const operationsToLink = await trx.operations.findMany({
			where: createdProfile
				? { status: 1 }
				: { status: 1, id: { in: createdOperationIds } },
			select: { id: true },
		});

		for (const operation of operationsToLink) {
			await trx.profile_operation.upsert({
				where: {
					operation_id_profile_id: {
						profile_id: adminProfile.id,
						operation_id: operation.id,
					},
				},
				update: {},
				create: {
					profile_id: adminProfile.id,
					operation_id: operation.id,
				},
			});
		}

		return {
			createdOperations: createdOperationIds.length,
			createdProfile,
			linkedOperations: operationsToLink.length,
			adminProfileId: adminProfile.id,
		};
	});
}
