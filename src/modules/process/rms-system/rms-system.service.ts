import { BadRequestException, Injectable } from '@nestjs/common';
import apiRmsSystem from '../../../common/services/api/rms';
import { RmsMachineSelect, RmsReasonCode, RmsRoutine } from './types/rms.type';

@Injectable()
export class RmsSystemService {
	private accessToken: string | null = null;
	private loginPromise: Promise<string> | null = null;

	async findMachines(): Promise<RmsMachineSelect[]> {
		return this.request<RmsMachineSelect[]>(
			'machines/select',
			'Ocorreu um erro ao consultar a listagem de máquinas do RMS',
		);
	}

	async findRoutinesByMachine(machine_id: number): Promise<RmsRoutine[]> {
		return this.request<RmsRoutine[]>(
			`configuration/routines?machine_id=${machine_id}`,
			'Ocorreu um erro ao consultar as rotinas do RMS',
		);
	}

	async findReasonCodes(): Promise<RmsReasonCode[]> {
		return this.request<RmsReasonCode[]>(
			'configuration/reason-code',
			'Ocorreu um erro ao consultar os reason codes do RMS',
		);
	}

	private async request<T>(path: string, errorMessage: string): Promise<T> {
		return this.executeLogin(async () => {
			const response = await apiRmsSystem.get(path);
			return response?.data as T;
		}).catch((error) => {
			console.error(error?.response?.data || error?.message);
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
		if (!this.accessToken || this.isTokenExpired(this.accessToken)) {
			if (!this.loginPromise) {
				this.loginPromise = (async () => {
					const response = await apiRmsSystem.post(
						'authentication/sign-in',
						{
							username: process.env.RMS_API_USER,
							password: process.env.RMS_API_PASSWORD,
							connect_ldap: false,
						},
					);

					const token = response?.data?.token;
					apiRmsSystem.defaults.headers.common.Authorization = `Bearer ${token}`;
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
	}
}
