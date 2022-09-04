// these are clones of the internal schemas for different things, but without sensitive or unneeded information
// this module cannot import anything since it is required by 2 different esconfigs

export const MESSAGES_PER_PAGE = 20;

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
export interface ClientUser {
  name: string;
  online: boolean;
  uuid: string;
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
  from: ClientUser;
  to: ClientUser;
}
export interface ClientUserSettings {
  pushNotifs: boolean;
}
export interface ClientSettings {}
export interface ClientGame {
  name: string;
  addedby: string;
  rating: number;
  credits: string;
  link: string;
  uuid: string;
  description: string;
}
export interface ClientGameCollection {
  creator: string;
  games: ClientGame[];
  uuid: string;
  name: string;
  description: string;
}
export interface Board{
  uuid: string;
  title: string;
  nodes: SerializedNode[]
}
export interface SerializedNode{
  name: string;
  pos: {x:number,y:number};
  description: string;
  children: SerializedNode[];
}

export interface Notification {
  heading:string;
  text:string;
}

export const enum RequestType {
  GET,
  POST,
  // really thats all i should need for now
}
export interface API {
  path: string;
  route: string;
  type: RequestType;
  request: object;
}
export interface Error {
  error: string;
  trace?: string;
}
export interface Failure{
  failure:string;
}
