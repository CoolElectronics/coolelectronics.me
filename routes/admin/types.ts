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

export interface StartDevSeverRequest{
  port: number,
  require: number, // 0 = anyone, 1 = trusted, 2 = admin
}
export const StartDevServer = {
  type: RequestType.POST,
  path: "startdev",
  route: "admin",
  request: {
    port: 8080,
    require: 0,
  }
}
export const StopDevServer = {
  type: RequestType.POST,
  path: "stopdev",
  route: "admin",
  request: {
  }
}
