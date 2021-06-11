import {UserType} from "../enums/UserType";

export type UserPayload = {
    user_id: string;
    org_id?: string;
    user_type: UserType;
}