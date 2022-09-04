import { RequestType,Board } from "../../clienttypes";


export type BoardsResponse = {title:string,uuid:string}[];
export const Boards = {
  type: RequestType.GET,
  path: "boards",
  route: "sparkboard",
  request:{
  }
}


export interface GetBoardRequest{
  uuid:string;
}
export type GetBoardResponse = Board;
export const GetBoard = {
  type: RequestType.POST,
  path: "board",
  route: "sparkboard",
  request:{
    uuid:""
  }
}

export type SaveBoardRequest = Board;
export const SaveBoard = {
  type: RequestType.POST,
  path: "saveboard",
  route: "sparkboard",
  request:{
    uuid:"",
    title: "",
    nodes:[]
  }
}

export type NewBoardResponse = Board;
export const NewBoard = {
  type:RequestType.POST,
  path: "newboard",
  route: "sparkboard",
  request:{}
}

export interface DeleteBoardRequest{
  uuid:string;
}
export const DeleteBoard = {
  type:RequestType.POST,
  path: "deleteboard",
  route: "sparkboard",
  request:{}
}
