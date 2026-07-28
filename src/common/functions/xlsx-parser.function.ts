import * as XLSX from 'xlsx';

export function parseXlsx(buffer: Buffer): any[] {
	const workbook = XLSX.read(buffer, { type: 'buffer' });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];

	const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
		raw: false,
	});

	return rows.map((row) => {
		const normalized: Record<string, string> = {};
		for (const key of Object.keys(row)) {
			normalized[key.trim().toLowerCase()] = row[key];
		}
		return normalized;
	});
}
