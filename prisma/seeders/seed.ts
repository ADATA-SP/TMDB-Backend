import { PrismaClient } from '.prisma/client';

import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	await prisma.users.upsert({
		where: { username: 'admin' },
		update: {},
		create: {
			email: 'admin@email.com',
			name: 'Administrador',
			username: 'admin',
			status: 1,
			password: await bcrypt.hash('admin', 10),
		},
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
