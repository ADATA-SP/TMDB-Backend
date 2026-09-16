import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCatalog } from './catalog';

const prisma = new PrismaClient();

const ADMIN_USERNAME = 'admin';

async function main() {
	const { adminProfileId } = await seedCatalog(prisma);

	const adminExists = await prisma.users.findUnique({
		where: { username: ADMIN_USERNAME },
	});

	if (adminExists) {
		if (adminExists.profile_id !== adminProfileId)
			await prisma.users.update({
				where: { id: adminExists.id },
				data: { profile_id: adminProfileId },
			});

		console.log(
			'Usuário admin já existe. A senha não foi alterada; o vínculo com o perfil admin foi garantido.',
		);
		return;
	}

	const password = process.env.SEED_ADMIN_PASSWORD || 'admin';

	await prisma.users.create({
		data: {
			email: 'admin@email.com',
			name: 'Administrador',
			username: ADMIN_USERNAME,
			status: 1,
			profile_id: adminProfileId,
			password: await bcrypt.hash(password, 10),
		},
	});

	console.log(
		process.env.SEED_ADMIN_PASSWORD
			? 'Usuário admin criado com a senha definida em SEED_ADMIN_PASSWORD.'
			: 'Usuário admin criado com a senha padrão "admin". Altere-a antes de liberar o ambiente.',
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
