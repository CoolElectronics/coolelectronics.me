import { ClientUser, RequestType } from "../../clienttypes";

export type GetAllUsersResponse = ClientUser[];
export const GetAllUsers = {
  type:RequestType.GET,
  path: "users",
  route: "admin",
  request:{},
}


export interface SetUserPermissionsRequest{
  uuid:string;
  permissions:object;
}
export const SetUserPermissions = {
  type: RequestType.POST,
  path: "setperms",
  route:"admin",
  request:{
    uuid:"",
    permissions:{},
  }
}
