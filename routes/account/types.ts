import { ClientFriendRequest, ClientUser, ClientUserSettings, Failure, RequestType } from "../../clienttypes";

export type GetSettingsResponse = ClientUserSettings;
export const GetSettings = {
  type: RequestType.GET,
  path: "/getsettings",
  route: "account",
  request: {},
}


export type AvailableFriendsResponse = ClientUser[];
export const AvaliableFriends = {
  type:RequestType.GET,
  path:"/availablefriends",
  route: "account",
  request:{
  }
}

export type MyFriendsResponse = ClientUser[];
export const MyFriends = {
  type: RequestType.GET,
  path: "/myfriends",
  route: "account",
  request: {},
}

export interface RequestFriendRequest{
  uuid:string;
}
export type RequestFriendResponse = null | Failure;
export const RequestFriend = {
  type:RequestType.POST,
  path: "/requestfriend",
  route: "account",
  request: {
    uuid:"",
  }
}
export interface RemoveFriendRequest{
  uuid:string;
}
export type RemoveFriendResponse = null;
export const RemoveFriend = {
  type:RequestType.POST,
  path: "/removefriend",
  route: "account",
  request: {
    uuid:"",
  }
}


export type GetFriendRequestsResponse = ClientFriendRequest[];
export const GetFriendRequests = {
  type: RequestType.GET,
  path: "/friendrequests",
  route:"account",
  request:{},
}


export interface FriendRequestRespondRequest{
  uuid:string;
  accept:boolean;
}
export type FriendRequestRespondResponse = null;
export const FriendRequestRespond = {
  type: RequestType.POST,
  path: "/requestrespond",
  route: "account",
  request:{
    uuid:"",
    accept:true,
  },
}

export interface PushSubscribeRequest{
  subscription: PushSubscription,
}
export type PushSubscribeResponse = null;
export const PushSubscribe = {
  type: RequestType.POST,
  path: "/pushsubscribe",
  route: "account",
  request: {
    subscription: {}
  }
}
