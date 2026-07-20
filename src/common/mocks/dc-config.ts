export const configMachines = [
	{
		code: 'WS01',
		getRecipe: (data) => data?.vidSet?.pos_recname,
		getStatus: (data) => data?.vidSet?.current_machine_state_name,
	},
	{
		code: 'WS02',
		getRecipe: (data) => data?.vidSet?.pos_recname,
		getStatus: (data) => data?.vidSet?.current_process_name,
	},
	{
		code: 'WG01',
		getRecipe: (data) => data?.vidSet?.ppchangename,
		getStatus: (data) => data?.vidSet?.process_state_name,
	},
	{
		code: 'WE01',
		getRecipe: (data) => data?.vidSet?.ct_dev,
		getStatus: (data) => data?.vidSet?.process_state_name,
	},
	{
		code: 'WG02',
		getRecipe: (data) => data?.vidSet?.ppchangename,
		getStatus: (data) => data?.vidSet?.process_state_name,
	},
	{
		code: 'LS01',
		getRecipe: (data) => data?.vidSet?.ppexecname?.split('\\')?.pop(),
		getStatus: (data) => data?.vidSet?.processstate_name,
	},
	{
		code: 'SS01',
		getRecipe: (data) => data?.vidSet?.dev_id,
		getStatus: (data) => data?.vidSet?.process_state_name,
	},
	{
		code: 'CM01',
		getRecipe: (data) => data?.vidSet?.ppchangename,
		getStatus: (data) => data?.vidSet?.processstate_name,
	},
	{
		code: 'SS03',
		getRecipe: (data) => data?.vidSet?.currentrecipename,
		getStatus: (data) => data?.vidSet?.process_state_name,
	},
];
