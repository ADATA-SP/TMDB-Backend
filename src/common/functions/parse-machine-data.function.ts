import { configMachines } from '../mocks/dc-config';

export function parseMachineData(
	code,
	responseData,
): { recipe: string; status: string; last_log?: Date } {
	const machine = configMachines.find((m) => m.code === code);
	if (!machine) throw new Error('Máquina não configurada');

	const recipeData = responseData.find(
		(item) => item.type.type === 'RECIPE_DATA',
	);

	const statusData = responseData.find(
		(item) => item.type.type === 'STATUS_DATA',
	);

	return {
		recipe: (machine.getRecipe(recipeData) ?? null)?.replace(/\s/g, ''),
		status: (machine.getStatus(statusData) ?? null)?.replace(/\s/g, ''),
		last_log: statusData?.createdAt ?? null,
	};
}
