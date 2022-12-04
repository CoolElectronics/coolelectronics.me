import { ClientUser, RequestType } from "../../clienttypes";

export interface StatusUser {
    uuid: string,
    token: string,
    delay: number,
    stati: string[],
    unusedstati?: string[],
}


export type GetStatusUserResponse = StatusUser;
export const GetStatusUser = {
    type: RequestType.GET,
    path: "stati",
    route: "status",
    request: {},
};


export interface SetSettingsRequest {
    token: string,
    delay: number,
    stati: string[],
}
export const SetSettings = {
    type: RequestType.POST,
    path: "delete",
    route: "status",
    request: {
        token: "",
        delay: 0,
        stati: [""]
    },
};
export const Wtf = {
    type: RequestType.POST,
    path: "wtf",
    route: "status",
    request: {
    },
};