import { AuthTokenUserProps } from './user.type';

export type Tokens = {
	token: string;
	user?: AuthTokenUserProps;
	message?: string;
};
