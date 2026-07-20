import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExcelService {
	async generateExcel(
		res: Response,
		dados: any[],
		titulo = 'Relatório',
		columns: { label: string; column: string }[],
	) {
		if (!dados || dados.length === 0) {
			throw new Error('Nenhum dado fornecido para gerar o Excel');
		}

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Relatório');

		const colCount = columns.length;
		const lastCol =
			colCount <= 26 ? String.fromCharCode(65 + colCount - 1) : undefined;
		worksheet.mergeCells(`A1:${lastCol || 'Z'}1`);
		const titleCell = worksheet.getCell('A1');
		titleCell.value = titulo;
		titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
		titleCell.font = { size: 16, bold: true };
		worksheet.getRow(1).height = 25;

		worksheet.addRow(columns.map((c) => c.label));
		worksheet.columns = columns.map((c) => ({
			key: c.column,
			width: c.label.length < 20 ? 20 : c.label.length,
		}));

		const headerRow = worksheet.getRow(2);
		headerRow.eachCell((cell) => {
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: '1F4E78' },
			};
			cell.font = { color: { argb: 'FFFFFF' }, bold: true };
			cell.alignment = { horizontal: 'center', vertical: 'middle' };
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
		});

		dados.forEach((item) => {
			const rowValues = columns.map((c) => item[c.column]);
			const row = worksheet.addRow(rowValues);

			row.eachCell((cell) => {
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				};
			});
		});

		res.header(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.attachment(`${titulo}.xlsx`);
		await workbook.xlsx.write(res);
		res.end();
	}
}
