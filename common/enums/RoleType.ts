import { registerEnumType } from '@nestjs/graphql';

export enum RoleType {
  super_admin = 'super_admin',
  admin = 'admin',
  content_creator = 'content_creator',
  content_consumer = 'content_consumer'
}
registerEnumType(RoleType, {
  name: 'RoleType'
});
