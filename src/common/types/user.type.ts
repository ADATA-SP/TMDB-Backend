export type AuthTokenUserProps = {
	id: number;
	name: string;
	username: string;
};

export type UserPayloadProps = {
	sub: string | number;
	username: string;
	user: AuthTokenUserProps;
};
