import {
  PipeTransform,
  Injectable,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { Types } from 'mongoose';
import {AppError} from "../constants/app-error.constants";

@Injectable()
export class IdValidationPipe implements PipeTransform<string, string> {
  constructor(private _idName?: string) {}

  public transform(id: string): string {
    const isValid = Types.ObjectId.isValid(id);
    if (!isValid)
      throw new HttpException(
        AppError.INCORRECT_ID(this._idName || 'id'),
        HttpStatus.BAD_REQUEST
      );

    return id;
  }
}
