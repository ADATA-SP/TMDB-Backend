import { BadRequestException } from '@nestjs/common';
import { Utils } from '../utils';
import { fromZonedTime } from 'date-fns-tz';

const timeZone = 'America/Sao_Paulo';

function normalizeDateTime(date: string): string {
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) {
		return `${date}:00`;
	}

	return date;
}

export function buildDateWhereClause(
	field: string,
	start?: string,
	end?: string,
	whereClause: any = {},
): any {
	start = start ? normalizeDateTime(start) : start;
	end = end ? normalizeDateTime(end) : end;

	if (!start && !end) {
		return whereClause;
	}

	const utils = Utils.getInstance();
	const hasTime = (date: string) => date.includes('T');

	if (start && !end) {
		const startDate = hasTime(start) ? start : `${start}T00:00:00`;
		const effectiveStartDate = fromZonedTime(startDate, timeZone);

		return {
			...whereClause,
			[field]: {
				gte: effectiveStartDate,
			},
		};
	}

	if (start && end) {
		const validatedStart = utils.validateDate(start);
		const validatedEnd = utils.validateDate(end);
		const range = utils.getDifferenceInDays(validatedStart, validatedEnd);

		if (range < 0 || range > 120) {
			throw new BadRequestException(
				'O range de datas deve ser entre 1 e 120 dias',
			);
		}

		const startDate = hasTime(start) ? start : `${start}T00:00:00`;
		const endDate = hasTime(end) ? end : `${end}T23:59:59.999`;
		const effectiveStartDate = fromZonedTime(startDate, timeZone);
		const effectiveEndDate = fromZonedTime(endDate, timeZone);

		return {
			...whereClause,
			[field]: {
				gte: effectiveStartDate,
				lte: effectiveEndDate,
			},
		};
	}

	return whereClause;
}
