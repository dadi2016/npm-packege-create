import { Field, ObjectType, InterfaceType } from '@nestjs/graphql';
import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IExtendedMongoModel } from "./extended-mongo.model";

@InterfaceType({
  resolveType: (value) => value['@class']
})
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export abstract class IBaseModel extends IExtendedMongoModel {

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Extra data' })
  @prop()
  public metadata?: JSON;

  @Field(() => [String], {
    nullable: true,
    description: "An array of ID's of users who liked the course"
  })
  @prop()
  public likes?: string[];

  @Field(() => [String], {
    nullable: true,
    description: "An array of ID's of users who subscribed to the course"
  })
  @prop()
  public subscribers?: string[];
}

@ObjectType({ implements: IBaseModel, isAbstract: true })
export abstract class BaseModel extends IBaseModel {}
