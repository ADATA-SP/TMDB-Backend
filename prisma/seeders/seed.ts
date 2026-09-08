import { PrismaClient, Prisma as PrismaType } from '.prisma/client';

import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
		description: 'Permissões',
		slug: 'permissions',
		status: 1,
		operations: [
			{ description: 'Editar Permissões', identifier: 'edit' },
			{ description: 'Visualizar Permissões', identifier: 'show' },
		],
	},
];

async function main() {
	await prisma.$transaction(async (trx: PrismaType.TransactionClient) => {
		for (const moduleData of modulesDataQuery) {
			const createdModule = await trx.modules.upsert({
				where: { slug: moduleData.slug },
				update: {},
				create: {
					description: moduleData.description,
					slug: moduleData.slug,
					status: moduleData.status,
				},
			});

			for (const op of moduleData.operations) {
				await trx.operations.upsert({
					where: {
						identifier: `${op.identifier}-${moduleData.slug}`,
					},
					update: {},
					create: {
						description: op.description,
						identifier: `${op.identifier}-${moduleData.slug}`,
						module_id: createdModule.id,
					},
				});
			}
		}

		const profileAdmin = await trx.profiles.upsert({
			where: { identifier: 'admin' },
			update: {},
			create: {
				identifier: 'admin',
				description: 'Administrador',
				external: 1,
				status: 1,
			},
		});

		const operations = await trx.operations.findMany({
			where: { status: 1 },
		});

		for (const operation of operations) {
			await trx.profile_operation.upsert({
				where: {
					operation_id_profile_id: {
						profile_id: profileAdmin.id,
						operation_id: operation.id,
					},
				},
				update: {},
				create: {
					profile_id: profileAdmin.id,
					operation_id: operation.id,
				},
			});
		}

		await trx.users.upsert({
			where: { username: 'admin' },
			update: { profile_id: profileAdmin.id },
			create: {
				email: 'admin@email.com',
				name: 'Administrador',
				username: 'admin',
				status: 1,
				profile_id: profileAdmin.id,
				password: await bcrypt.hash('admin', 10),
			},
		});
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
