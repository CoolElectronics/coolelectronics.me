export interface ClientRoom {
  uuid: string;
  name: string;
  owner: string;
  users: {
    name:string,
    online:boolean,
  }[];
  public: boolean;
}
// export type ClientNotification = ClientFriendRequestNotification | ClientRoomInviteNotification;
// export interface ClientFriendRequestNotifaction{
//   kind: "a",
//   
// }
export interface ClientSelf{
  username: string,
  uuid: string,
  permissions: object
}

export interface ClientChatMessage {
  uuid: string;
  roomuuid:string;
  sender: string;
  sendername:string;
  message: string;
  timestamp: Date;
  sent: boolean;
  //reply?
}
export interface ClientFriendRequest{
  type: "incoming" | "outbound",
  from: string,
  to: string,
}

export interface ClientSettings{

}
