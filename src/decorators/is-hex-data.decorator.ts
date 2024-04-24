import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import {
	registerDecorator,
	ValidatorConstraint,
	ValidationOptions,
	ValidatorConstraintInterface,
    ValidationArguments
} from 'class-validator';

export type IsHexDataOptions = {
	disallowEmpty?: boolean;
};

export function IsHexData(
	props: IsHexDataOptions = {} 
) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isHexData',
			target: object.constructor,
			propertyName,
			constraints: [props],
			validator: IsHexDataValidator
		});
	};
}

@ValidatorConstraint({ name: 'isHexData' })
@Injectable()
export class IsHexDataValidator implements ValidatorConstraintInterface {
	private propName: string;

	validate(value: any, args: ValidationArguments) {
		this.propName = args.property;

		const [options] = args.constraints;

		const disallowEmpty = options !== undefined
				&& options && typeof options == 'object'
			? options.disallowEmpty ?? false
			: false;

		if (value === null || value === undefined)
			return false;

		if (typeof value == 'number' && Number.isInteger(value))
			return true;

		if (typeof value != 'string')
			return false;

		if (/^[0-9]{1,}$/.test(value))
			return true;

		if (disallowEmpty) {
			if (/^0x[A-Za-z0-9]{1,}$/.test(value))
				return true;
		} else {
			if (/^0x[A-Za-z0-9]{0,}$/.test(value))
				return true;
		}

		return false;
	}

	defaultMessage() {
		return `${this.propName} must be numeric/hexadecimal`;
	}
}
