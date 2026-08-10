import { BadRequestException, Injectable } from '@nestjs/common';
import { MachineCommandProps } from './utils/types/type';
import apiDataBffCollection from '../../../common/services/api/data-bff-collection';
import apiDataCollection from '../../../common/services/api/data-collection';
import { parseMachineData } from '../../../common/functions/parse-machine-data.function';
import { signDcToken } from '../../../common/functions/sign-token-dc.function';
import { JwtService } from '@nestjs/jwt';
import { hostCommandConfig } from '../../../common/mocks/host-command-config';

@Injectable()
export class DataCollectionService {
	private mountedToken: string | null = null;
	private loginPromise: Promise<string> | null = null;

	constructor(private readonly jwtService: JwtService) {}

	async parseDataMachineLatest(
		machine_code: string,
		log_type: number[],
	): Promise<{
		recipe: string;
		status: string;
		last_log?: Date;
	}> {
		const dataMachine = await this.findDataMachineLatest(
			machine_code,
			log_type,
		);

		return parseMachineData(machine_code, dataMachine?.data);
	}

	async findDataMachineLatest(machine_code: string, log_type: number[]) {
		return this.executeLogin(async () => {
			const response = await apiDataBffCollection.get(
				`data/${machine_code}/latest`,
				{
					params: {
						logTypes: log_type,
						wrapper: 'machineDataLatestAx',
						allRequestParams: JSON.stringify({}),
					},
				},
			);

			return response?.data;
		})
			.then((res) => res)
			.catch((error) => {
				throw new BadRequestException({
					message:
						'Ocorreu um erro ao consultar o codígo de máquina no BFF ' +
						error?.message,
				});
			});
	}

	async runCommandMachine(machine_props: MachineCommandProps) {
		const machineConfig = hostCommandConfig[machine_props.machine];

		const hasParameters =
			machine_props.parameter1 || machine_props.parameter2;

		if (hasParameters && machineConfig?.haveHostCommandWithParameters) {
			machine_props.hostCommand = 'HostCommandWithParameters';
		} else {
			machine_props.hostCommand = 'HostCommand';
		}

		return this.executeLogin(async () => {
			const response = await apiDataCollection.post('machine/command', {
				...machine_props,
			});
			return response?.data;
		})
			.then((res) => res)
			.catch((error) => {
				throw new BadRequestException({
					message:
						'Ocorreu um erro ao enviar comando de máquina no Data Collection',
					error: {
						status: error?.response?.status,
						statusText: error?.response?.statusText,
					},
					data: error?.response?.data,
				});
			});
	}

	async runCommandMachineAlarm(machine_props: {
		ip: string;
		port: string;
		machine: string;
		tid: number;
		text: string;
	}) {
		return this.executeLogin(async () => {
			const response = await apiDataCollection.post('/machine/alarm', {
				...machine_props,
			});
			return response?.data;
		})
			.then((res) => res)
			.catch((error) => {
				throw new BadRequestException({
					message:
						'Ocorreu um erro ao enviar comando de IHM máquina no Data Collection',
					error: {
						status: error?.response?.status,
						statusText: error?.response?.statusText,
					},
					data: error?.response?.data,
				});
			});
	}

	private isTokenExpired(token: string): boolean {
		try {
			const [, payloadBase64] = token.split('.');
			if (!payloadBase64) return true;
			const payload = JSON.parse(
				Buffer.from(payloadBase64, 'base64').toString(),
			);
			return payload.exp * 1000 < Date.now() + 60000;
		} catch {
			return true;
		}
	}

	private async executeLogin<T>(callback: () => Promise<T>): Promise<T> {
		try {
			if (!this.mountedToken || this.isTokenExpired(this.mountedToken)) {
				if (!this.loginPromise) {
					this.loginPromise = (async () => {
						const response = await apiDataBffCollection.post(
							'auth/login',
							{
								login: process.env.DATA_COLLECTION_API_USER,
								password:
									process.env.DATA_COLLECTION_API_PASSWORD,
							},
						);

						const { api_key, jwt_secret } = response?.data;

						const token = await signDcToken(
							api_key,
							this.jwtService,
							'24h',
							jwt_secret,
						);

						apiDataBffCollection.defaults.headers.common.Authorization = `Bearer ${token}`;
						apiDataCollection.defaults.headers.common.Authorization = `Bearer ${token}`;
						return token;
					})();
				}

				try {
					this.mountedToken = await this.loginPromise;
				} finally {
					this.loginPromise = null;
				}
			}

			try {
				return await callback();
			} catch (err: any) {
				if (
					err?.response?.status === 401 ||
					err?.response?.status === 403
				) {
					this.mountedToken = null;
				}
				throw err;
			}
		} catch (error) {
			throw new BadRequestException({
				message:
					'Ocorreu um erro ao realizar login na API Data Collection: ' +
					error,
			});
		}
	}
}
