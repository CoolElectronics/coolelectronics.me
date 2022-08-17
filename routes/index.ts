import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { noop } from "svelte/internal";
import { App, CachedUser, parse, RequestType } from "../main";
import { constructClientUser, Room, User } from "../db";
import { ClientSelf } from "../clienttypes";
import { sendRoom } from "./chat";

export function socketConnect(state: App, socket: Socket) {
  let cookies = parse(socket.request.headers.cookie);
  state.db.Validate(
    cookies,
    {},
    (user: User) => {
      let cached: [Socket | null, CachedUser] | null = state.usercache.getVal(
        user.uuid
      );
      let send = !cached || !cached[1].online;
      if (!user.pushsubscription) {
        socket.emit("account:pushworkerresubscribe");
      }

      state.usercache.setVal(user.uuid, socket, {
        username: user.username,
        online: true,
        setOfflineTimer: null,
      });
      if (send) {
        userStatusUpdate(state, user.uuid);
      }

      socket.on("disconnect", () => {
        let [socket, cacheduser]: [Socket | null, CachedUser] =
          state.usercache.getVal(user.uuid)!;
        if (cacheduser.setOfflineTimer) {
          clearTimeout(cacheduser.setOfflineTimer);
        }
        cacheduser.setOfflineTimer = setTimeout(() => {
          cacheduser.online = false;
          userStatusUpdate(state, user.uuid);
        }, 10000);
        cacheduser.online = false;
        state.usercache.setVal(user.uuid, null, cacheduser);
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
      require: {},
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
      require: {},
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        res.send(await constructClientUser(state, req.body.uuid));
      },
    },
  ],
};
async function userStatusUpdate(state: App, userid: string) {
  let rooms = await state.db.getAll<Room>("Rooms");
  for (let room of rooms) {
    if (room.users.includes(userid)) {
      sendRoom(state, room);
    }
  }
}
