import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { noop } from "svelte/internal";
import { App, CachedUser, parse, RequestType } from "../main";
import { User } from "../db";
import { ClientSelf } from "../clienttypes";

export function socketConnect(state: App, socket: Socket) {
  let cookies = parse(socket.request.headers.cookie);
  state.db.Validate(
    cookies,
    {},
    (user:User) => {
      state.usercache.setVal(user.uuid,socket,{
        username:user.username,
        online:true
      });
      socket.on("disconnect",()=>{
        let dat:[Socket | null,CachedUser] = state.usercache.getVal(user.uuid)!;
        dat[1].online = false;
        state.usercache.setVal(user.uuid,null,dat[1]);
      });
    },
    () => {},
    () => {}
  );
}

export default {
  path: "",
  route: (state: App, req: Request, res: Response) => {
    state.db.Validate(
      req.cookies,
      {},
      () => {
        res.redirect("/home");
      },
      () => {
        res.sendFile(global.rootDir + "/dist/src/index.html");
      }
    );
  },
  listeners: [],
  api: [
    {
      path: "me",
      type: RequestType.GET,
      route: (state: App, req, res) => {
        state.db.Validate(
          req.cookies,
          {},
          (user: User) => {
            let clientself:ClientSelf = {
              username:user.username,
              uuid: user.uuid,
              permissions: user.permissions,
            
            };
            res.status(200).send(clientself);
          },
          () => {
            res.status(401).send("you aren't signed in? how exactly...");
            console.error("smthing happened here");
          }
        );
      },
    },
  ], };
