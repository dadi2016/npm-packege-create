import {Schema} from 'mongoose';
import {buildSchema, plugin, prop} from '@typegoose/typegoose';
import {Field, ID, InterfaceType, ObjectType} from '@nestjs/graphql';
import * as mongoose_delete from 'mongoose-delete';
import {HttpException, HttpStatus} from "@nestjs/common";
import * as mongoose_autopopulate from 'mongoose-autopopulate';

@InterfaceType({
  // workaround for bug: https://github.com/nestjs/graphql/issues/1065
  resolveType: (value) => value['@class']
})
@plugin(mongoose_delete, {overrideMethods: true, deletedBy: true})
@plugin(mongoose_autopopulate)
export abstract class IMongoModel {
  @Field(() => ID, {description: 'Document ID'})
  public _id?: string;

  @Field(() => Date, {
    nullable: true,
    description: `Document's creation date`
  })
  @prop()
  public created_at?: Date;

  @Field(() => Date, {description: 'Date when the document was updated last time'})
  @prop()
  public last_updated_at?: Date;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: 'Has the document been deleted'
  })
  @prop()
  public deleted?: boolean;

  static get schema(): Schema {
    return buildSchema(this as any, {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'last_updated_at'
      },
      toJSON: {
        getters: true,
        virtuals: true
      }
    });
  }


  static softDelete = async function (
    _id: string,
    user_id?: string
  ): Promise<boolean> {
    const doc = await this.findById(_id);
    if (!doc)
      throw new HttpException(
        'Instance of ' + this.modelName.toString() + ' not found',
        HttpStatus.NOT_FOUND);

    if (user_id && user_id.toString() !== doc.created_by.toString()) {
      throw new Error(
        'User is not a creator'
      );
    }

    const query = await doc.delete(user_id);

    return query.n !== 0;
  };
}

@ObjectType({implements: IMongoModel, isAbstract: true})
export abstract class MongoModel extends IMongoModel {
}
