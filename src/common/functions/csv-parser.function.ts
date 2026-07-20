import * as csv from 'csv-parser';
import { Readable } from 'stream';

export function parseCsv(buffer: Buffer): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const results = [];
		const stream = Readable.from(buffer.toString());

		stream
			.pipe(csv())
			.on('data', (data) => results.push(data))
			.on('end', () => resolve(results))
			.on('error', (err) =>
				reject(err instanceof Error ? err : new Error(String(err))),
			);
	});
}
