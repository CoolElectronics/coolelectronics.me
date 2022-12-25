import { Failure, RequestType } from "../../clienttypes";

export interface CreateFileRequest {
  name: string;
  visibility: FileVisibility;
  url: string;
  type: FileType;
  description: string;
}
export type CreateFileResponse = ClientFile | Failure;
export const CreateFile = {
  type: RequestType.POST,
  path: "createfile",
  route: "ftp",
  request: {
    name: "",
    url: "",
    description: "",
    type: 0,
    visibility: 0,
  }
}
export interface EditFileRequest {
  uuid: string;
  name: string;
  visibility: FileVisibility;
}
export type EditFileResponse = ClientFile;
export const EditFile = {
  type: RequestType.POST,
  path: "editfile",
  route: "ftp",
  request: {
    uuid: "",
    name: "",
    visibility: 0,
  }
}


export enum FileVisibility {
  PRIVATE,
  // UNLISTED,
  PUBLIC,
}
export enum FileType {
  IMAGE,
  VIDEO,
  RAW,
}
export interface ClientFile {
  uuid: string;
  url: string;
  name: string;
  viewedtimes: number;
  description: string;
  ips: string[];
  type: FileType;
}
export interface File {
  uuid: string;
  num: number;
  url: string;
  description: string;
  name: string;
  visibility: FileVisibility;
  owner: string;
  viewedtimes: number;
  ips: string[];
  type: FileType;
}
