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
  type: FileType;
  url: string;
  description: string;
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
    url: "",
    description: "",
    visibility: 0,
    type: 0,
  }
}


export const GetFiles = {
  type: RequestType.GET,
  path: "files",
  route: "ftp",
  request: {}
}
export type GetFilesResponse = ClientFile[];


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
  description: string;
  type: FileType;
  visibility: FileVisibility;
}
export interface File {
  uuid: string;
  num: number;
  url: string;
  description: string;
  name: string;
  visibility: FileVisibility;
  owner: string;
  type: FileType;
}
