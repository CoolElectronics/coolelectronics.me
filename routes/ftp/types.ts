import { RequestType } from "../../clienttypes";

export interface CreateFileRequest{
  name: string;
  visibility:FileVisibility;
  url:string;
}
export type CreateFileResponse = ClientFile;
export const CreateFile = {
  type: RequestType.POST,
  path: "createfile",
  route: "ftp",
  request:{
    name:"",
    url:"",
    visibility:0,
  }
}
export interface EditFileRequest{
  uuid:string;
  name: string;
  visibility:FileVisibility;
}
export type EditFileResponse = ClientFile;
export const EditFile = {
  type: RequestType.POST,
  path: "editfile",
  route: "ftp",
  request:{
    uuid:"",
    name:"",
    visibility:0,
  }
}


export enum FileVisibility{
  PRIVATE,
  UNLISTED,
  PUBLIC,
}
export interface ClientFile{
  uuid:string;
  url:string;
  name:string;
  viewedtimes:number;
  ips: string[];
}
