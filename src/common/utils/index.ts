import { BadRequestException } from '@nestjs/common';

export class Utils {
	private static instance: Utils;

	public static getInstance(): Utils {
		if (!Utils.instance) {
			Utils.instance = new Utils();
		}
		return Utils.instance;
	}

	getCurrentHour() {
		const currentDate = new Date();
		const dataHourFormated = currentDate.toLocaleString('pt-BR');
		const current_time = dataHourFormated.split(' ');
		const date_parts = current_time[0].split('/');

		return `${date_parts[2].substring(0, 4)}-${date_parts[1]}-${date_parts[0]}T${current_time[1]}.000Z`;
	}

	validateDate(dateString: string) {
		const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?$/;

		if (!isoRegex.test(dateString)) {
			throw new BadRequestException('Data inválida');
		}

		const [datePart] = dateString.split('T');
		const [year] = datePart.split('-').map(Number);

		if (year < 1000 || year > 9999) {
			throw new BadRequestException(
				'Ano fora do intervalo permitido (1000-9999).',
			);
		}

		const formattedDate = new Date(dateString);

		if (isNaN(formattedDate.getTime())) {
			throw new BadRequestException('Data inválida.');
		}

		return formattedDate;
	}

	getDifferenceInDays(start, end) {
		const oneDayInMs = 1000 * 60 * 60 * 24;
		const differenceInMs = end.getTime() - start.getTime();
		return Math.floor(differenceInMs / oneDayInMs);
	}
}
