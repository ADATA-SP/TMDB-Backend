import * as bcrypt from 'bcryptjs';

export const hashData = async (password: string) => bcrypt.hash(password, 10);
