import { Injectable, Logger } from '@nestjs/common';
import { Prisma as PrismaType } from '.prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { RmsSystemService } from '../rms-system/rms-system.service';
import { RmsReasonCode, RmsRoutine } from '../rms-system/types/rms.type';

export type RmsImportSummary = {
	enabled: boolean;
	imported: number;
	skipped: number;
	failed: number;
};

@Injectable()
export class MachinesImportService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly rmsSystemService: RmsSystemService,
	) {}

	private readonly logger = new Logger(MachinesImportService.name);

	async importRoutinesFromRms(codes: string[]): Promise<RmsImportSummary> {
		const summary: RmsImportSummary = {
			enabled: process.env.ENABLE_RMS_IMPORT === 'true',
			imported: 0,
			skipped: 0,
			failed: 0,
		};

		if (!summary.enabled || !codes.length) return summary;

		let rmsMachines: Map<string, number>;
		let reasonCodesByRoutine: Map<number, RmsReasonCode[]>;

		try {
			const machines = await this.rmsSystemService.findMachines();
			rmsMachines = new Map(machines.map((m) => [m.code, m.id]));

			const reasonCodes = await this.rmsSystemService.findReasonCodes();
			reasonCodesByRoutine = reasonCodes.reduce((acc, item) => {
				const current = acc.get(item.routine_id) ?? [];
				current.push(item);
				acc.set(item.routine_id, current);
				return acc;
			}, new Map<number, RmsReasonCode[]>());
		} catch (error) {
			this.logger.error(
				`Não foi possível consultar o RMS. As máquinas foram sincronizadas sem rotinas: ${error?.message}`,
			);
			summary.failed = codes.length;
			return summary;
		}

		for (const code of codes) {
			try {
				const importedRoutines = await this.importMachine(
					code,
					rmsMachines,
					reasonCodesByRoutine,
				);

				if (importedRoutines) summary.imported += 1;
				else summary.skipped += 1;
			} catch (error) {
				summary.failed += 1;
				this.logger.error(
					`Falha ao importar rotinas da máquina ${code}: ${error?.message}`,
				);
			}
		}

		return summary;
	}

	private async importMachine(
		code: string,
		rmsMachines: Map<string, number>,
		reasonCodesByRoutine: Map<number, RmsReasonCode[]>,
	): Promise<boolean> {
		const machine = await this.prismaService.machines.findFirst({
			where: { code, is_blocked: 0 },
		});

		if (!machine) return false;

		const alreadyConfigured = await this.prismaService.routines.count({
			where: { machine_id: machine.id },
		});

		if (alreadyConfigured) {
			this.logger.log(
				`Máquina ${code} já possui rotinas no TMDB. Importação ignorada.`,
			);
			return false;
		}

		const rmsMachineId = rmsMachines.get(code);

		if (!rmsMachineId) return false;

		const routines =
			await this.rmsSystemService.findRoutinesByMachine(rmsMachineId);

		if (!routines?.length) return false;

		for (const routine of routines) {
			await this.copyRoutine(
				routine,
				machine.id,
				reasonCodesByRoutine.get(routine.id) ?? [],
			);
		}

		this.logger.log(
			`Máquina ${code}: ${routines.length} rotina(s) importada(s) do RMS.`,
		);

		return true;
	}

	private async copyRoutine(
		routine: RmsRoutine,
		machine_id: number,
		reasonCodes: RmsReasonCode[],
	) {
		await this.prismaService.$transaction(
			async (trx: PrismaType.TransactionClient) => {
				const createdRoutine = await trx.routines.create({
					data: {
						type: routine.type,
						machine_id,
						description: routine.description,
						delay_execution: routine.delay_execution,
						validate_recipe_success:
							routine.validate_recipe_success,
						ignore_recipe_validation:
							routine.ignore_recipe_validation,
					},
				});

				const orderedActions = routine.routine_action
					.slice()
					.sort((a, b) => a.position - b.position);

				for (const routineAction of orderedActions) {
					const action = routineAction.actions;

					let localAction = await trx.actions.findFirst({
						where: {
							name: action.name,
							description: action.description,
						},
					});

					if (!localAction)
						localAction = await trx.actions.create({
							data: {
								name: action.name,
								description: action.description,
								command: action.command,
								machine_type: action.machine_type,
							},
						});

					await trx.routine_action.create({
						data: {
							routine_id: createdRoutine.id,
							action_id: localAction.id,
							position: routineAction.position,
						},
					});
				}

				if (reasonCodes.length)
					await trx.reason_code.createMany({
						data: reasonCodes.map((item) => ({
							code: item.code,
							ignored: item.ignored,
							routine_id: createdRoutine.id,
						})),
					});
			},
		);
	}
}
