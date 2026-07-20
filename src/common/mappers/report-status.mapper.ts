export const REPORT_STATUS_DATA: Record<
	number,
	{
		label: string;
	}
> = {
	0: {
		label: 'RECEITA - INVÁLIDA',
	},
	1: {
		label: 'RECEITA - VÁLIDA',
	},
	4: {
		label: 'MÁQUINA - STOP',
	},
	5: {
		label: 'MÁQUINA - DOWN / PL / PLRUN',
	},
	6: {
		label: 'MÁQUINA - SETUP',
	},
	7: {
		label: 'MÁQUINA - SETUP-Ignorado',
	},
	8: {
		label: 'IGNORAR VALIDAÇÃO',
	},
	9: {
		label: 'MÁQUINA SEM TRACKIN',
	},
	10: {
		label: 'CADASTRAR PART_NUMBER',
	},
	11: {
		label: 'MÁQUINA SEM CONEXÃO',
	},
	99: {
		label: 'Status pendente',
	},
};
