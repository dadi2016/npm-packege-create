import {registerEnumType} from '@nestjs/graphql';

export enum UserType {
    tutor = 'tutor',
    student = 'student'
}

registerEnumType(UserType, {
    name: 'UserType'
});
