import {
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ async: false })
export class IsID implements ValidatorConstraintInterface {
  public validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    return Types.ObjectId.isValid(value);
  }
}
