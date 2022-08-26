import {
  ClientChatMessage,
  ClientRoom,
  ClientUser,
  RequestType,
} from "../../clienttypes";

export interface FetchRequest {
  page: number;
  id: string;
}
export type FetchResponse = ClientChatMessage[];
export const Fetch = {
  type: RequestType.POST,
  path: "/fetch",
  route: "chat",
  request: {
    page: 1,
    id: "",
  },
};

export interface NewRoomRequest {
  name: string;
  public: boolean;
}
export type NewRoomResponse = ClientRoom;
export const NewRoom = {
  type: RequestType.POST,
  path: "/newroom",
  route: "chat",
  request: {
    name: "",
    public: false,
  },
};

export type FetchPublicResponse = ClientRoom[];
export const FetchPublic = {
  type: RequestType.GET,
  path: "/fetchpublic",
  route: "chat",
  request: {},
};

export interface JoinPublicRequest {
  uuid: string;
}
export type JoinPublicResponse = null;
export const JoinPublic = {
  type: RequestType.POST,
  path: "/joinpublic",
  route: "chat",
  request: {
    uuid: "",
  },
};

export interface InviteUserRequest {
  room: string;
  user: string;
}
export type InviteUserResponse = null;
export const InviteUser = {
  type: RequestType.POST,
  path: "/inviteuser",
  route: "chat",
  request: {
    room: "",
    user: "",
  },
};
export interface RemoveUserRequest {
  room: string;
  user: string;
}
export type RemoveUserResponse = null;
export const RemoveUser = {
  type: RequestType.POST,
  path: "/removeuser",
  route: "chat",
  request: {
    room: "",
    user: "",
  },
};

export interface InvitableUsersRequest {
  room: string;
}
export type InvitableUsersResponse = ClientUser[];
export const InvitableUsers = {
  type: RequestType.POST,
  path: "/invitableusers",
  route: "chat",
  request: {
    room: "",
  },
};

export interface ChangeRoomSettingsRequest {
  room: string;
  name: string;
  public: boolean;
}
export type ChangeRoomSettingsResponse = null;
export const ChangeRoomSettings = {
  type: RequestType.POST,
  path: "/changeroomsettings",
  route: "chat",
  request: {
    room: "",
    name: "",
    public: false,
  },
};
export interface DeleteRoomRequest {
  room: string;
}
export type DeleteRoomResponse = null;
export const DeleteRoom = {
  type: RequestType.POST,
  path: "/deleteroom",
  route: "chat",
  request: {
    room: "",
  },
};
export interface LeaveRoomRequest {
  room: string;
}
export type LeaveRoomResponse = null;
export const LeaveRoom = {
  type: RequestType.POST,
  path: "/leaveroom",
  route: "chat",
  request: {
    room: "",
  },
};
