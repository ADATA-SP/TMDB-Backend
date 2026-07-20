export const formatUTCDateTimestamp = (date: string) => {
	const originalDate = new Date(date);
	originalDate.setUTCHours(originalDate.getUTCHours() - 4);
	const dateFormating = originalDate?.toISOString();
	return new Date(dateFormating);
};

export const formatDate = (dateString: string): string => {
	const d = new Date(dateString);
	return d.toISOString().split('T')[0];
};

export const formatShortDate = (dateString: string): string => {
	const date = new Date(dateString);

	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear()).padStart(2, '0');

	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
};
