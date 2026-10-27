import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Prisma as PrismaType, tooling_datamatrix } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
	MesMachineTooling,
	MesTooling,
	UserPayloadProps,
} from '../../../common/types';
import { ToolingStatus } from '../../../common/enums/toolings.enum';
import { PaginateOutputDto } from '../../../common/dto/paginate-output.dto';
import { AuditLogRepository } from '../../access-control/audit/audit.repository';
import { NotificationRepository } from '../../access-control/notification/notification.repository';
import { MesSystemService } from '../mes-system/mes-system.service';
import { LinkDatamatrixDto } from './dto/link-datamatrix.dto';
import {
	ListAvailableToolingDto,
	ListInputToolingDto,
	ListOutputToolingDto,
	ToolingMachineInputDto,
} from './dto/list-tooling.dto';

const LOG_TYPE = 'Tooling';

type ToolingLog = {
	tooling_sn: string;
	machine_code: string | null;
	operation: string;
	notification: string;
};

@Injectable()
export class ToolingsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly mesSystemService: MesSystemService,
		private readonly auditLogRepository: AuditLogRepository,
		private readonly notificationRepository: NotificationRepository,
	) {}

	async findAll(
		listInputToolingDto: ListInputToolingDto,
	): Promise<PaginateOutputDto<ListOutputToolingDto>> {
		const { page, offset, machine_id, search, name, status } =
			listInputToolingDto;
		const normalizedSearch = search?.trim().toLowerCase();
		const normalizedName = name?.trim().toLowerCase();

		const toolings = (await this.loadToolings(machine_id)).filter(
			(tooling) => {
				if (
					normalizedSearch &&
					![tooling.name, tooling.type, tooling.tooling_sn].some(
						(value) =>
							value?.toLowerCase().includes(normalizedSearch),
					)
				)
					return false;

				if (
					normalizedName &&
					tooling.name?.toLowerCase() !== normalizedName
				)
					return false;

				return !status || tooling.status === status;
			},
		);

		return this.paginate(toolings, page, offset);
	}

	async findNames(toolingMachineInputDto: ToolingMachineInputDto) {
		const toolings = await this.loadToolings(
			toolingMachineInputDto.machine_id,
		);

		return [...new Set(toolings.map((tooling) => tooling.name))].sort(
			(a, b) => a.localeCompare(b),
		);
	}

	async findAvailable(listAvailableToolingDto: ListAvailableToolingDto) {
		const { type } = listAvailableToolingDto;

		const toolings = await this.mesSystemService.findAvailableToolings(
			type ? { TOOLING_TYPE: [type] } : {},
		);

		return toolings.map((tooling) => ({
			id: tooling.TOOLING_SN_ID,
			tooling_sn: tooling.TOOLING_SN,
			tooling_id: tooling.TOOLING_ID,
			code: tooling.TOOLING_NO,
			name: tooling.TOOLING_NAME,
			type: tooling.TOOLING_TYPE,
			description: tooling.TOOLING_DESC ?? '',
		}));
	}

	async findHistory(tooling_sn_id: number) {
		const history = await this.mesSystemService.findToolingsHistory({
			TOOLING_SN_ID: [tooling_sn_id],
		});

		return history.map((item) => ({
			machine_code: item.MACHINE_CODE,
			machine_description: item.MACHINE_DESC,
			machine_localization: item.MACHINE_LOC,
			total_used: item.TOTAL_USED_COUNT ?? 0,
			used_count: item.USED_COUNT ?? 0,
			up_time: item.UP_TIME,
			up_emp_no: item.UP_EMP_NO,
			down_time: item.DOWN_TIME,
			down_emp_no: item.DOWN_EMP_NO,
		}));
	}

	async findByDatamatrix(datamatrix: string) {
		if (!datamatrix) return null;

		const link = await this.prismaService.tooling_datamatrix.findFirst({
			where: { datamatrix },
		});

		if (!link) return null;

		return (
			(await this.findToolingBySn(link.tooling_sn_id, link)) ??
			this.toOutputFromLink(link)
		);
	}

	async findOne(tooling_sn_id: number) {
		const tooling = await this.findToolingBySn(tooling_sn_id);

		if (!tooling)
			throw new NotFoundException({
				message: 'Tooling não encontrado no MES.',
			});

		return tooling;
	}

	async linkDatamatrix(
		tooling_sn_id: number,
		linkDatamatrixDto: LinkDatamatrixDto,
		currentUser: UserPayloadProps,
	) {
		const tooling = await this.findOne(tooling_sn_id);
		const { datamatrix } = linkDatamatrixDto;

		if (tooling.datamatrix?.toLowerCase() === datamatrix.toLowerCase())
			throw new BadRequestException({
				message: 'Este Data Matrix já pertence ao tooling.',
			});

		const linkExists =
			await this.prismaService.tooling_datamatrix.findFirst({
				where: { datamatrix, NOT: { tooling_sn_id } },
			});

		if (linkExists)
			throw new ConflictException({
				message: `Este Data Matrix já está vinculado ao tooling ${linkExists.tooling_sn}.`,
			});

		const isReplacing = Boolean(tooling.datamatrix);

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await this.registerLogs(
					{
						tooling_sn: tooling.tooling_sn,
						machine_code: tooling.machine_code,
						operation: isReplacing
							? 'Alteração de Data Matrix'
							: 'Vínculo de Data Matrix',
						notification: isReplacing
							? 'Alteração de Data Matrix do tooling'
							: 'Vínculo de Data Matrix ao tooling',
					},
					currentUser,
					trx,
				);

				return trx.tooling_datamatrix.upsert({
					where: { tooling_sn_id },
					update: {
						datamatrix,
						tooling_sn: tooling.tooling_sn,
						updated_at: new Date(),
					},
					create: {
						tooling_sn_id,
						tooling_sn: tooling.tooling_sn,
						datamatrix,
					},
				});
			})
			.catch((error) => {
				if (error?.code === 'P2002')
					throw new ConflictException({
						message:
							'Este Data Matrix já está vinculado a outro tooling.',
					});

				throw new BadRequestException(error);
			});

		return {
			message: isReplacing
				? 'Data Matrix alterado com sucesso!'
				: 'Data Matrix vinculado com sucesso!',
		};
	}

	async unlinkDatamatrix(
		tooling_sn_id: number,
		currentUser: UserPayloadProps,
	) {
		const link = await this.prismaService.tooling_datamatrix.findUnique({
			where: { tooling_sn_id },
		});

		if (!link)
			throw new BadRequestException({
				message: 'O tooling não possui Data Matrix vinculado.',
			});

		await this.prismaService
			.$transaction(async (trx: PrismaType.TransactionClient) => {
				await this.registerLogs(
					{
						tooling_sn: link.tooling_sn,
						machine_code: null,
						operation: 'Desvínculo de Data Matrix',
						notification: 'Desvínculo de Data Matrix do tooling',
					},
					currentUser,
					trx,
				);

				return trx.tooling_datamatrix.delete({
					where: { id: link.id },
				});
			})
			.catch((error) => {
				throw new BadRequestException(error);
			});

		return {
			message: 'Data Matrix desvinculado com sucesso!',
		};
	}

	private async loadToolings(
		machine_id?: number,
	): Promise<ListOutputToolingDto[]> {
		let catalog: MesTooling[];
		let machineToolings: MesMachineTooling[];

		if (machine_id) {
			const machine = await this.findMachine(machine_id);

			machineToolings = await this.mesSystemService.findMachineToolings({
				machine_code: [machine.code],
			});

			if (!machineToolings.length) return [];

			catalog = await this.mesSystemService.findToolings({
				TOOLING_SN_ID: this.uniqueSnIds(machineToolings),
			});
		} else {
			[catalog, machineToolings] = await Promise.all([
				this.mesSystemService.findToolings(),
				this.mesSystemService.findMachineToolings(),
			]);
		}

		const snIds = machine_id
			? this.uniqueSnIds(machineToolings)
			: this.uniqueSnIds([...catalog, ...machineToolings]);

		const links = await this.prismaService.tooling_datamatrix.findMany({
			where: machine_id ? { tooling_sn_id: { in: snIds } } : {},
		});

		const catalogBySn = new Map(
			catalog.map((tooling) => [tooling.TOOLING_SN_ID, tooling]),
		);
		const linkBySn = new Map(
			links.map((link) => [link.tooling_sn_id, link]),
		);
		const machineToolingBySn = this.groupMachineToolings(machineToolings);

		return snIds
			.map((snId) =>
				this.toOutput(
					catalogBySn.get(snId),
					machineToolingBySn.get(snId),
					linkBySn.get(snId),
				),
			)
			.sort(
				(a, b) =>
					a.name.localeCompare(b.name) ||
					a.tooling_sn.localeCompare(b.tooling_sn),
			);
	}

	private async findToolingBySn(
		tooling_sn_id: number,
		knownLink?: tooling_datamatrix,
	): Promise<ListOutputToolingDto | null> {
		const [catalog, machineToolings, link] = await Promise.all([
			this.mesSystemService.findToolings({
				TOOLING_SN_ID: [tooling_sn_id],
			}),
			this.mesSystemService.findMachineToolings({
				TOOLING_SN_ID: [tooling_sn_id],
			}),
			knownLink ??
				this.prismaService.tooling_datamatrix.findUnique({
					where: { tooling_sn_id },
				}),
		]);

		const catalogItem = catalog.find(
			(tooling) => tooling.TOOLING_SN_ID === tooling_sn_id,
		);
		const machineTooling =
			this.groupMachineToolings(machineToolings).get(tooling_sn_id);

		if (!catalogItem && !machineTooling) return null;

		return this.toOutput(catalogItem, machineTooling, link);
	}

	private async findMachine(machine_id: number) {
		const machine = await this.prismaService.machines.findFirst({
			where: { id: machine_id, is_blocked: 0 },
			select: { id: true, code: true },
		});

		if (!machine)
			throw new NotFoundException({ message: 'Máquina não encontrada.' });

		return machine;
	}

	private groupMachineToolings(machineToolings: MesMachineTooling[]) {
		const grouped = new Map<number, MesMachineTooling>();

		for (const machineTooling of machineToolings) {
			const current = grouped.get(machineTooling.TOOLING_SN_ID);

			if (
				!current ||
				(!current.MACHINE_CODE && machineTooling.MACHINE_CODE)
			)
				grouped.set(machineTooling.TOOLING_SN_ID, machineTooling);
		}

		return grouped;
	}

	private uniqueSnIds(toolings: { TOOLING_SN_ID: number }[]) {
		return [...new Set(toolings.map((tooling) => tooling.TOOLING_SN_ID))];
	}

	private toOutput(
		catalogItem: MesTooling | undefined,
		machineTooling: MesMachineTooling | undefined,
		link: tooling_datamatrix | null | undefined,
	): ListOutputToolingDto {
		const base = catalogItem ?? machineTooling;
		const datamatrix = link?.datamatrix ?? null;

		return {
			id: base.TOOLING_SN_ID,
			tooling_sn: base.TOOLING_SN,
			tooling_id: catalogItem?.TOOLING_ID ?? null,
			code: base.TOOLING_NO,
			name: base.TOOLING_NAME,
			type: base.TOOLING_TYPE,
			description: base.TOOLING_DESC ?? '',
			machine_code: machineTooling?.MACHINE_CODE ?? null,
			mes_status: machineTooling?.MACHINE_CODE ? 'LINKED' : 'AVAILABLE',
			total_used:
				machineTooling?.TOTAL_USED_COUNT ??
				catalogItem?.USED_COUNT ??
				0,
			max_used_count:
				catalogItem?.STS_MAX_USED_COUNT ??
				catalogItem?.MAX_USED_COUNT ??
				null,
			limit_used_count:
				catalogItem?.STS_LIMIT_USED_COUNT ??
				catalogItem?.LIMIT_USED_COUNT ??
				null,
			datamatrix,
			status: datamatrix ? ToolingStatus.LINKED : ToolingStatus.UNLINKED,
		};
	}

	private toOutputFromLink(link: tooling_datamatrix): ListOutputToolingDto {
		return {
			id: link.tooling_sn_id,
			tooling_sn: link.tooling_sn,
			tooling_id: null,
			code: '',
			name: link.tooling_sn,
			type: '',
			description: '',
			machine_code: null,
			mes_status: 'AVAILABLE',
			total_used: 0,
			max_used_count: null,
			limit_used_count: null,
			datamatrix: link.datamatrix,
			status: ToolingStatus.LINKED,
		};
	}

	private paginate<T>(
		items: T[],
		page: number,
		offset: number,
	): PaginateOutputDto<T> {
		const perPage = Math.max(1, offset);
		const currentPage = Math.max(1, page);
		const total = items.length;
		const lastPage = Math.max(1, Math.ceil(total / perPage));
		const startIndex = (currentPage - 1) * perPage;

		return {
			data: items.slice(startIndex, startIndex + perPage),
			meta: {
				total,
				lastPage,
				currentPage,
				perPage,
				prev: currentPage > 1 ? currentPage - 1 : null,
				next: currentPage < lastPage ? currentPage + 1 : null,
			},
		};
	}

	private async registerLogs(
		{ tooling_sn, machine_code, operation, notification }: ToolingLog,
		currentUser: UserPayloadProps,
		trx: PrismaType.TransactionClient,
	) {
		await this.notificationRepository.createMany(
			{
				user_id: Number(currentUser.sub),
				type: LOG_TYPE,
				description: notification,
				machine_code: machine_code?.slice(0, 20) ?? null,
			},
			trx,
		);

		await this.auditLogRepository.createMany(
			{
				user_id: Number(currentUser.sub),
				description: tooling_sn.slice(0, 100),
				operation,
				type: LOG_TYPE,
			},
			trx,
		);
	}
}
