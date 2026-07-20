import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Client } from 'ldapts';

@Injectable()
export class LdapService {
	private createClient(): Client {
		return new Client({
			url: process.env.LDAP_SERVER,
		});
	}

	async authenticate({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): Promise<any> {
		const client = this.createClient();

		try {
			const validateUser = await this.searchUsers({
				identifier: username,
			});

			if (validateUser?.length) {
				await client.bind(validateUser[0]?.['dn'], password);
				await client.unbind();
				return {
					...validateUser[0],
				};
			}
		} catch (err) {
			await client.unbind().catch(() => {});
			throw new UnauthorizedException(
				'Credenciais inválidas por favor verifique' + err,
			);
		}
	}

	async searchUsers({ identifier }: { identifier: string }): Promise<any[]> {
		const client = this.createClient();
		const baseDN = process.env.LDAP_BASE;

		try {
			await client.bind(process.env.LDAP_USER, process.env.LDAP_PASSWORD);

			const filter = `(${process.env.LDAP_ATTRIBUTE}=${identifier})`;

			const { searchEntries } = await client.search(baseDN, {
				scope: 'sub',
				filter,
				attributes: [process.env.LDAP_ATTRIBUTE, 'mail', 'displayName'],
			});

			await client.unbind();

			// if (!searchEntries?.length)
			// 	throw new BadRequestException('Usuário não encontrado no LDAP');

			return searchEntries?.map((item) => ({
				...item,
				mail: item?.mail?.length ? item?.mail : null,
			}));
		} catch (err) {
			await client.unbind().catch(() => {});
			throw new BadRequestException({
				message: err,
			});
		}
	}
}
