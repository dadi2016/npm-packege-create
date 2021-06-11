import { Field, ObjectType, InterfaceType } from '@nestjs/graphql';
import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import {IMongoModel} from "./mongo.model";

@InterfaceType({
    resolveType: (value) => value['@class']
})
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export abstract class IExtendedMongoModel extends IMongoModel {
    @Field(() => String, { nullable: true, description: 'The creator of the current document' })
    @prop(() => String)
    public created_by?: string;

    @Field(() => String, {
        nullable: true,
        description: 'ID of the user, who last updated this document'
    })
    @prop()
    public last_updated_by?: string;

    @Field(() => String, {
        nullable: true,
        description: 'ID of the organization the creator of the document belongs to'
    })
    @prop()
    public org_id?: string;
}

@ObjectType({ implements: IExtendedMongoModel, isAbstract: true })
export abstract class ExtendedMongoModel extends IExtendedMongoModel {}
