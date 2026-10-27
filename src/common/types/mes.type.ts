type RunningItem = {
	RC_NO: string;
	WORK_ORDER: string;
	PART_NO: string;
	ROUTE_NAME: string;
	PROCESS_NAME: string;
};

export type MachineMes = {
	machine_code: string;
	machine_status: string;
	reason_code: string | null;
	running: RunningItem[];
};

export type MesToolingFilters = {
	TOOLING_TYPE?: string[];
	TOOLING_SN?: string[];
	TOOLING_SN_ID?: (string | number)[];
};

export type MesMachineToolingFilters = MesToolingFilters & {
	machine_code?: string[];
	machine_loc?: string[];
	process_id?: (string | number)[];
};

export type MesTooling = {
	TOOLING_ID: number;
	TOOLING_NO: string;
	TOOLING_NAME: string;
	TOOLING_DESC: string | null;
	TOOLING_TYPE: string;
	TOOLING_SN_ID: number;
	TOOLING_SN: string;
	TOOLING_SN_DESC: string | null;
	MAX_USED_COUNT: number | null;
	LIMIT_USED_COUNT: number | null;
	STS_MAX_USED_COUNT: number | null;
	STS_LIMIT_USED_COUNT: number | null;
	USED_COUNT: number | null;
	STATUS: string | null;
};

export type MesAvailableTooling = Pick<
	MesTooling,
	| 'TOOLING_SN_ID'
	| 'TOOLING_SN'
	| 'TOOLING_ID'
	| 'TOOLING_NO'
	| 'TOOLING_NAME'
	| 'TOOLING_DESC'
	| 'TOOLING_TYPE'
>;

export type MesToolingHistory = {
	MACHINE_CODE: string;
	MACHINE_DESC: string;
	MACHINE_LOC: string;
	TOOLING_SN_ID: number;
	TOOLING_SN: string;
	TOOLING_NO: string;
	TOOLING_NAME: string;
	TOOLING_DESC: string | null;
	TOOLING_TYPE: string;
	TOTAL_USED_COUNT: number | null;
	USED_COUNT: number | null;
	UP_TIME: string | null;
	UP_EMP_NO: string | null;
	DOWN_TIME: string | null;
	DOWN_EMP_NO: string | null;
};

export type MesMachineTooling = {
	MACHINE_CODE: string | null;
	MACHINE_DESC: string | null;
	MACHINE_LOC: string | null;
	TOOLING_SN_ID: number;
	TOOLING_SN: string;
	TOOLING_NO: string;
	TOOLING_NAME: string;
	TOOLING_DESC: string | null;
	TOOLING_TYPE: string;
	TOTAL_USED_COUNT: number | null;
	USED_COUNT: number | null;
	UP_TIME: string | null;
	UP_EMP_NO: string | null;
	PART_NO: string | null;
	PROCESS_NAME: string | null;
	PROCESS_ID: number | null;
	TOOLING_QTY: number | null;
	TOOLING_STATUS: 'LINKED' | 'AVAILABLE';
};
