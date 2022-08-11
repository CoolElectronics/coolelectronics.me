// these are clones of the internal schemas for different things, but without sensitive or unneeded information
// this module cannot import anything since it is required by 2 different esconfigs

export interface ClientRoom {
  uuid: string;
  name: string;
  owner: string;
  users: ClientUser[];
  public: boolean;
}
// export type ClientNotification = ClientFriendRequestNotification | ClientRoomInviteNotification;
// export interface ClientFriendRequestNotifaction{
//   kind: "a",
//
// }
export interface ClientSelf {
  username: string;
  uuid: string;
  permissions: object;
}
export interface ClientUser{
  name:string;
  online:boolean;
  uuid:string;
}

export interface ClientChatMessage {
  uuid: string;
  roomuuid: string;
  sender: string;
  sendername: string;
  message: string;
  timestamp: Date;
  sent: boolean;
  //reply?
}
export interface ClientFriendRequest {
  uuid: string;
  from: string;
  to: string;
}
export interface ClientUserSettings {
  pushNotifs: boolean;
}
export interface ClientSettings {}
