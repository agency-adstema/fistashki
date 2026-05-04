import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBlogFaqList', async: false })
export class IsBlogFaqListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, _args: ValidationArguments): boolean {
    if (value === undefined || value === null) return true;
    if (!Array.isArray(value)) return false;
    return value.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as { question?: unknown }).question === 'string' &&
        typeof (item as { answer?: unknown }).answer === 'string',
    );
  }

  defaultMessage(): string {
    return 'faq must be an array of { question: string; answer: string } (or valid JSON string of that array)';
  }
}

export function IsBlogFaqList(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isBlogFaqList',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsBlogFaqListConstraint,
    });
  };
}
