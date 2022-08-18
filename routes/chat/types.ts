import {
  ClientChatMessage,
  ClientRoom,
  ClientUser,
  RequestType,
} from "../../clienttypes";

export interface ChatFetchRequest {
  page: number;
  id: string;
}
export type ChatFetchResponse = ClientChatMessage[];
export const ChatFetch = {
  type: RequestType.POST,
  path: "/fetch",
  route: "chat",
  request: {
    page: 1,
    id: "",
  },
};

export interface ChatNewRoomRequest {
  name: string;
  public: boolean;
}
export type ChatNewRoomResponse = ClientRoom;
export const ChatNewRoom = {
  type: RequestType.POST,
  path: "/newroom",
  route: "chat",
  request: {
    name: "",
    public: false,
  },
};

export type ChatFetchPublicResponse = ClientRoom[];
export const ChatFetchPublic = {
  type: RequestType.GET,
  path: "/fetchpublic",
  route: "chat",
  request: {},
};

export interface ChatJoinPublicRequest {
  uuid: string;
}
export type ChatJoinPublicResponse = null;
export const ChatJoinPublic = {
  type: RequestType.POST,
  path: "/joinpublic",
  route: "chat",
  request: {
    uuid: "",
  },
};

export interface ChatInviteUserRequest {
  room: string;
  user: string;
}
export type ChatInviteUserResponse = null;
export const ChatInviteUser = {
  type: RequestType.POST,
  path: "/inviteuser",
  route: "chat",
  request: {
    room: "",
    user: "",
  },
};
export interface ChatRemoveUserRequest {
  room: string;
  user: string;
}
export type ChatRemoveUserResponse = null;
export const ChatRemoveUser = {
  type: RequestType.POST,
  path: "/removeuser",
  route: "chat",
  request: {
    room: "",
    user: "",
  },
};

export interface ChatInvitableUsersRequest {
  room: string;
}
export type ChatInvitableUsersResponse = ClientUser[];
export const ChatInvitableUsers = {
  type: RequestType.POST,
  path: "/invitableusers",
  route: "chat",
  request: {
    room: "",
  },
};

export interface ChatChangeRoomSettingsRequest {
  room: string;
  name: string;
  public: boolean;
}
export type ChatChangeRoomSettingsResponse = null;
export const ChatChangeRoomSettings = {
  type: RequestType.POST,
  path: "/changeroomsettings",
  route: "chat",
  request: {
    room: "",
    name: "",
    public: false,
  },
};
export interface ChatDeleteRoomRequest {
  room: string;
}
export type ChatDeleteRoomResponse = null;
export const ChatDeleteRoom = {
  type: RequestType.POST,
  path: "/deleteroom",
  route: "chat",
  request: {
    room: "",
  },
};
export interface ChatLeaveRoomRequest {
  room: string;
}
export type ChatLeaveRoomResponse = null;
export const ChatLeaveRoom = {
  type: RequestType.POST,
  path: "/leaveroom",
  route: "chat",
  request: {
    room: "",
  },
};
