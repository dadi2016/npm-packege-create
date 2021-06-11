import {InputType, Field, Int} from '@nestjs/graphql';
import {IsInt, IsOptional, Min, Validate} from 'class-validator';
import {AppError} from "../../common/constants/app-error.constants";
import {IsID} from "../..";

@InputType()
export class PaginationInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  take = 0;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @Validate(IsID, {message: AppError.INCORRECT_ID()})
  after?: string;
}
