import { User } from "../../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, error, parse } from "../../main";
import * as Sparkboard from "./types"
import { Board, Error } from "../../clienttypes";
import { randomUUID } from "crypto";
export default {
  path: "sparkboard",
  route: (state: App,user:User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/sparkboard/sparkboard.html");
  },
  require: {},
  listeners: [],
  api: [
    {
      api: Sparkboard.Boards,
      require: {},
      route: async (state:App,user:User): Promise<Sparkboard.BoardsResponse> =>{
        let boards:Sparkboard.BoardsResponse = [];
        for (let id of user.boards){
          let board = await state.db.getOne<Board>("Boards",{uuid:id});
          if (board){
            boards.push({
              title: board.title,
              uuid:id,
            });
          }
        }
        return boards;
      }
    },
    {
      api: Sparkboard.GetBoard,
      require:{},
      route: async (state:App,user:User,body:Sparkboard.GetBoardRequest): Promise<Sparkboard.GetBoardResponse | Error> =>   {
        let board = await state.db.getOne<Board>("Boards",{uuid:body.uuid});
        if (board){
          return board;
        }else{
          return error("null board");
        }
      }
    },
    {
      api:Sparkboard.SaveBoard,
      require:{},
      route: async (state:App,user:User,body:Sparkboard.SaveBoardRequest):Promise<null | Error> =>{
        if (!user.boards.includes(body.uuid)) return error("not your board >:(");
        state.db.modifyOne("Boards",{uuid:body.uuid},(board)=>{
          Object.assign(board,body); 
        });
        return null;
      }
    },{
      api:Sparkboard.NewBoard,
      require:{},
      route: async (state:App,user:User):Promise<Sparkboard.NewBoardResponse>=>{
        let board:Board = {
          uuid:randomUUID(),
          title: "Untitled Board",
          nodes:[]
        };
        await state.db.modifyOneProp("Users",{uuid:user.uuid},"boards",(b)=>[...b,board.uuid]);
        await state.db.addOne("Boards",board);
        return board;
      }
    },
    {
      api:Sparkboard.DeleteBoard,
      require:{},
      route: async (state:App,user:User,body:Sparkboard.DeleteBoardRequest): Promise<null | Error> =>{
        if (!user.boards.includes(body.uuid)) return error("not your board");
        await state.db.database.collection("Boards").deleteOne({uuid:body.uuid});
        await state.db.modifyOneProp("Users",{uuid:user.uuid},"boards",b=>b.filter(e=>e != body.uuid));
        return null;
      }
    }
  ],
};
