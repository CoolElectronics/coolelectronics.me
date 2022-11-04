import { ClientSelf, ClientUser, RequestType } from "../../clienttypes";

export interface ResetPasswordRequest {
  username:string;
  password:string;
}
export const ResetPassword = {
  type: RequestType.POST,
  path: "resetpassword",
  route: "sign",
  request:{
    username:"",
    password:"",
  }
}

export type ResetPasswordResponse = boolean;



export interface PasswordReset{
  uuid:string;
  hash:string;
}
