import { ClientSelf, ClientUser, RequestType } from "../../clienttypes";

export type SelfResponse = ClientSelf;
export const Self = {
  type: RequestType.GET,
  path: "me",
  route: "",
  request:{},
}

export interface GetUserRequest{
  uuid:string;
}
export type GetUserResponse = ClientUser;
export const GetUser = {
  type: RequestType.POST,
  path: "user",
  route: "",
  request:{
    uuid:"",
  }
}



