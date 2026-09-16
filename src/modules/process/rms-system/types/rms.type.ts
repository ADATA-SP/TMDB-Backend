export type RmsMachineSelect = {
	id: number;
	code: string;
};

export type RmsAction = {
	id: number;
	name: string | null;
	description: string | null;
	command: string;
	machine_type: string | null;
};

export type RmsRoutineAction = {
	routine_id: number;
	action_id: number;
	position: number;
	actions: RmsAction;
};

export type RmsRoutine = {
	id: number;
	type: string;
	machine_id: number;
	delay_execution: number;
	description: string | null;
	validate_recipe_success: number;
	ignore_recipe_validation: number | null;
	routine_action: RmsRoutineAction[];
};

export type RmsReasonCode = {
	id: number;
	code: string;
	ignored: number;
	routine_id: number;
};
