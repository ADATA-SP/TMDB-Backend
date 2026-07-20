import { Injectable } from '@nestjs/common';
import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	registerDecorator,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchValidator implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		const { object } = args;
		const password = object['password'];
		const confirmPassword = value;

		return password === confirmPassword;
	}

	defaultMessage(args: ValidationArguments) {
		return (
			args.constraints[0] ||
			'A senha e a confirmação de senha devem ser iguais'
		);
	}
}

export function PasswordMatch(validationOptions?: {
	message?: string;
}): (object: object, propertyName: string) => void {
	return (object: object, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: PasswordMatchValidator,
		});
	};
}
