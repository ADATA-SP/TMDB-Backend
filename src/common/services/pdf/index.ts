// pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
	async generateDynamicTablePDF(
		res: Response,
		columns: { label: string; column: string }[],
		rows: any[],
		properties?: { title?: string; filename?: string },
	): Promise<void> {
		const doc = new PDFDocument({
			margin: 30,
			size: 'A4',
			layout: 'landscape',
		});

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`'inline; filename=${properties?.filename || 'reports'}.pdf'`,
		);
		doc.pipe(res);

		const pageWidth = doc.page.width;
		const pageHeight = doc.page.height;
		const marginLeft = doc.page.margins.left;
		const marginRight = doc.page.margins.right;
		const contentWidth = pageWidth - marginLeft - marginRight;

		const assetsDir = path.join(process.cwd(), 'assets');
		const headerImagePath = path.join(assetsDir, 'image-1.png');
		const footerImagePath = path.join(assetsDir, 'image-2.png');

		if (fs.existsSync(headerImagePath)) {
			doc.image(headerImagePath, marginLeft, 20, {
				width: contentWidth,
			});
		}

		doc.y = 20 + 20;

		doc.fontSize(16).text(`${properties?.title || 'Report'}`, {
			align: 'center',
		});
		doc.moveDown();

		const tableTop = doc.y + 10;
		const rowHeight = 25;
		const cellPadding = 5;
		const colWidth = contentWidth / columns.length;

		let y = tableTop;

		const drawFooter = () => {
			if (fs.existsSync(footerImagePath)) {
				const yFooter = pageHeight - 60;
				doc.image(footerImagePath, contentWidth / 2 - 20, yFooter, {
					width: 125,
				});
			}
		};

		this.columnRender(
			columns,
			doc,
			marginLeft,
			colWidth,
			rowHeight,
			y,
			cellPadding,
		);

		// columns.forEach((col, i) => {
		// 	const x = marginLeft + i * colWidth;

		// 	doc.rect(x, y, colWidth, rowHeight)
		// 		.fill('#393C55')
		// 		.fillColor('#fff');

		// 	doc.rect(x, y, colWidth, rowHeight)
		// 		.stroke()
		// 		.fontSize(10)
		// 		.text(col.label, x + cellPadding, y + cellPadding, {
		// 			width: colWidth - 2 * cellPadding,
		// 			align: 'left',
		// 		});
		// });

		doc.fillColor('#000000');

		y += rowHeight;

		for (const row of rows) {
			for (let i = 0; i < columns.length; i++) {
				const col = columns[i];
				const x = marginLeft + i * colWidth;
				const value =
					row[col.column] !== undefined
						? String(row[col.column])
						: '';

				doc.rect(x, y, colWidth, rowHeight)
					.stroke()
					.fontSize(5)
					.text(value, x + cellPadding, y + cellPadding, {
						width: colWidth - 2 * cellPadding,
						align: 'left',
					});
			}

			y += rowHeight;

			if (y + rowHeight > pageHeight - 60) {
				drawFooter();
				doc.addPage();
				y = tableTop;

				this.columnRender(
					columns,
					doc,
					marginLeft,
					colWidth,
					rowHeight,
					y,
					cellPadding,
				);

				// columns.forEach((col, i) => {
				// 	const x = marginLeft + i * colWidth;

				// 	doc.rect(x, y, colWidth, rowHeight)
				// 		.fill('#393C55')
				// 		.fillColor('#fff');

				// 	doc.rect(x, y, colWidth, rowHeight)
				// 		.stroke()
				// 		.fontSize(10)
				// 		.text(col.label, x + cellPadding, y + cellPadding, {
				// 			width: colWidth - 2 * cellPadding,
				// 			align: 'left',
				// 		});
				// });

				doc.fillColor('#000000');

				y += rowHeight;
			}
		}

		drawFooter();
		doc.end();
	}

	private columnRender(
		columns,
		doc,
		marginLeft,
		colWidth,
		rowHeight,
		y,
		cellPadding,
	) {
		return columns.forEach((col, i) => {
			const x = marginLeft + i * colWidth;

			doc.rect(x, y, colWidth, rowHeight)
				.fill('#393C55')
				.fillColor('#fff');

			doc.rect(x, y, colWidth, rowHeight)
				.stroke()
				.fontSize(10)
				.text(col.label, x + cellPadding, y + cellPadding, {
					width: colWidth - 2 * cellPadding,
					align: 'left',
				});
		});
	}
}
