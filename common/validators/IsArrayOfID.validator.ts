import {
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ async: false })
export class IsArrayOfID implements ValidatorConstraintInterface {
  public validate(array: unknown): boolean {
    if (!Array.isArray(array)) {
      return false;
    }

    for (let i = 0; i < array.length; i++) {
      if (!Types.ObjectId.isValid(array[i])) {
        return false;
      }
    }
    return true;
  }
}
