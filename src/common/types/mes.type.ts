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
