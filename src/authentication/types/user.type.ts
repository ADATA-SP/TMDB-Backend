export type AuthUserProps = {
	id: number;
	name?: string;
	username: string;
	email?: string;
	status?: string | number;
	profile_id?: string | number;
	profile_identifier?: string;
	operations?: string[];
};
