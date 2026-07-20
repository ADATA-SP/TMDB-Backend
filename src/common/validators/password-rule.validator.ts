import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	registerDecorator,
	ValidationOptions,
} from 'class-validator';

interface StrongPasswordOptions {
	field?: string;
	message?: string;
}

@ValidatorConstraint({ name: 'password', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
	validate(password: string, args: ValidationArguments) {
		if (!args.constraints) {
			args.constraints = [];
		}

		if (password.length < 8) {
			args.constraints[0] = 'deve ter pelo menos 8 caracteres.';
			return false;
		}
		if (!/[A-Z]/.test(password)) {
			args.constraints[0] = 'deve conter pelo menos uma letra maiúscula.';
			return false;
		}
		if (!/[a-z]/.test(password)) {
			args.constraints[0] = 'deve conter pelo menos uma letra minúscula.';
			return false;
		}
		if (!/[@*$!-]/.test(password)) {
			args.constraints[0] =
				'deve conter pelo menos um caractere especial (@, $, *, !, -).';
			return false;
		}
		if (!/[0-9]/.test(password)) {
			args.constraints[0] = 'deve conter pelo menos um número.';
			return false;
		}
		if (/\s/.test(password)) {
			args.constraints[0] = 'não deve conter espaços.';
			return false;
		}

		return true;
	}

	defaultMessage(args: ValidationArguments) {
		const field = args.constraints[1] || 'Campo';
		const customMessage = args.constraints[2];
		if (customMessage) {
			return customMessage.replace('$field', field);
		}
		return `Campo ${field} ${args.constraints[0]}`;
	}
}

export function IsStrongPassword(
	options: StrongPasswordOptions = {},
	validationOptions?: ValidationOptions,
) {
	const { field = 'Campo', message } = options;
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [null, field, message],
			validator: PasswordValidator,
		});
	};
}
