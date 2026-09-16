import { PrismaClient } from '@prisma/client';
import { seedCatalog } from './catalog';

const prisma = new PrismaClient();

async function main() {
	const summary = await seedCatalog(prisma);

	console.log(
		`Catálogo de permissões: ${summary.createdOperations} operação(ões) criada(s), ` +
			`perfil admin ${summary.createdProfile ? 'criado' : 'existente'}, ` +
			`${summary.linkedOperations} operação(ões) vinculada(s) ao admin.`,
	);
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
