import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { noop } from "svelte/internal";
import { App, CachedUser, parse, RequestType } from "../main";
import { constructClientUser, User } from "../db";
import { ClientSelf } from "../clienttypes";

export function socketConnect(state: App, socket: Socket) {
  let cookies = parse(socket.request.headers.cookie);
  state.db.Validate(
    cookies,
    {},
    (user: User) => {
      state.usercache.setVal(user.uuid, socket, {
        username: user.username,
        online: true,
      });
      socket.on("disconnect", () => {
        let dat: [Socket | null, CachedUser] = state.usercache.getVal(
          user.uuid
        )!;
        dat[1].online = false;
        state.usercache.setVal(user.uuid, null, dat[1]);
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
      require:{},
      route: (state: App, user: User, req: Request, res: Response) => {
        let clientself: ClientSelf = {
          username: user.username,
          uuid: user.uuid,
          permissions: user.permissions,
        };
        res.send(clientself);
      },
    },
    {
      path: "user",
      require:{},
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        res.send(await constructClientUser(state,req.body.uuid));
      },
    },
  ],
};
