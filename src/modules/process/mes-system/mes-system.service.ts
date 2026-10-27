import { BadRequestException, Injectable } from '@nestjs/common';
import apiMesSystem from '../../../common/services/api/mes';
import {
	MachineMes,
	MesAvailableTooling,
	MesMachineTooling,
	MesMachineToolingFilters,
	MesTooling,
	MesToolingFilters,
	MesToolingHistory,
} from '../../../common/types';

@Injectable()
export class MesSystemService {
	private accessToken: string | null = null;
	private loginPromise: Promise<string> | null = null;

	async findDataMachineStatus(
		machine_code: string,
	): Promise<MachineMes | any> {
		return this.executeLogin(async () => {
			const response = await apiMesSystem.get(
				`apimaster/sao/rms/machines/${machine_code}`,
			);
			return response?.data;
		})
			.then((res) => res)
			.catch((error) => {
				console.error(error?.data || error?.message);
				throw new BadRequestException({
					message:
						'Ocorreu um erro ao consultar a status de máquinas do MES',
				});
			});
	}

	async findDataMachine() {
		return this.executeLogin(async () => {
			const response = await apiMesSystem.get(
				`apimaster/sao/rms/machines`,
			);
			return response?.data;
		})
			.then((res) => res)
			.catch((error) => {
				console.error(error?.data || error?.message);
				throw new BadRequestException({
					message:
						'Ocorreu um erro ao consultar a listagem de máquinas do MES',
				});
			});
	}

	async findToolings(filters: MesToolingFilters = {}) {
		return this.findToolingData<MesTooling>(
			'apimaster/sao/tmdb/toolings',
			filters,
			'Ocorreu um erro ao consultar os toolings do MES',
		);
	}

	async findAvailableToolings(filters: MesToolingFilters = {}) {
		return this.findToolingData<MesAvailableTooling>(
			'apimaster/sao/tmdb/toolings/available',
			filters,
			'Ocorreu um erro ao consultar os toolings disponíveis do MES',
		);
	}

	async findToolingsHistory(filters: MesMachineToolingFilters = {}) {
		return this.findToolingData<MesToolingHistory>(
			'apimaster/sao/tmdb/toolings/history',
			filters,
			'Ocorreu um erro ao consultar o histórico de toolings do MES',
		);
	}

	async findMachineToolings(filters: MesMachineToolingFilters = {}) {
		return this.findToolingData<MesMachineTooling>(
			'apimaster/sao/tmdb/machines/toolings',
			filters,
			'Ocorreu um erro ao consultar os toolings das máquinas do MES',
		);
	}

	private async findToolingData<T>(
		path: string,
		params: MesToolingFilters | MesMachineToolingFilters,
		errorMessage: string,
	): Promise<T[]> {
		return this.executeLogin(async () => {
			const response = await apiMesSystem.get<T[]>(path, { params });
			return Array.isArray(response?.data) ? response.data : [];
		}).catch((error) => {
			console.error(error?.data || error?.message);
			throw new BadRequestException({ message: errorMessage });
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
			if (!this.accessToken || this.isTokenExpired(this.accessToken)) {
				if (!this.loginPromise) {
					this.loginPromise = (async () => {
						const response = await apiMesSystem.post(
							'/auth/login',
							{
								username: process.env.MES_API_USER,
								password: process.env.MES_API_PASSWORD,
							},
						);
						const token = response?.data?.access_token;
						apiMesSystem.defaults.headers.common.Authorization = `Bearer ${token}`;
						return token;
					})();
				}

				try {
					this.accessToken = await this.loginPromise;
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
					this.accessToken = null;
				}
				throw err;
			}
		} catch (error: any) {
			console.error(
				error?.response?.data || error?.data || error?.message,
			);
			throw new BadRequestException({
				message: 'Ocorreu um erro ao realizar login na API MES',
			});
		}
	}
}
