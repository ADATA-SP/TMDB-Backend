export const validateJson = (jsonString) => {
	if (typeof jsonString !== 'string') return false;

	try {
		JSON.parse(jsonString);
		return true;
	} catch {
		return false;
	}
};

export function hasKey<T extends object>(obj: T, key: string): boolean {
	return key in obj;
}
