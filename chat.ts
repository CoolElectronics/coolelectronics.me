import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "./main";

export default {
  path: "/chat",
  route: (state: App, req: Request, res: Response) => {
        res.sendFile(__dirname + "/dist/src/chat/chat.html");
  },
  require:{
    chat:{}
  },
  listeners: [
    {
      path: "send"
    }
  ],
  api: [
    {
      path: "fetch",
      require:{
        chat:{}
      },
      route: (state:App,req:Request,res:Response)=>{
        
      }
    }
  ],
};
