import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { noop } from "svelte/internal";
import { App, CachedUser, parse } from "../../main";
import { constructClientUser, Room, User } from "../../db";
import { ClientSelf, ClientUser, RequestType } from "../../clienttypes";
import { sendRoom } from "../chat/chat";
import { GetUser, GetUserRequest, GetUserResponse, Self, SelfResponse } from "./types";

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
    () => { },
    () => { }
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
      api: Self,
      require: {},
      route: async (state: App, user: User): Promise<SelfResponse> => {
        let clientself: ClientSelf = {
          username: user.username,
          uuid: user.uuid,
          permissions: user.permissions,
        };
        return clientself;
      },
    },
    {
      api: GetUser,
      require: {},
      route: async (state: App, user: User, body: GetUserRequest): Promise<GetUserResponse> => {
        return await constructClientUser(state, body.uuid);
      },
    },
  ],
  seopage: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CoolElectronics.me</title>
        <meta name = "description" content = "Hello, I'm CoolElectronics, this is my website">
      </head>
      <body>
        <a href = "/"></a>
        <a href = "/games"></a>
        <a href = "/sparkboard"></a>
        <a href = "/chat"></a>
        <a href = "/ftp"></a>
        <h1>CoolElectronics.me</h1>
        <p>
        This is coolelectronics.me, a website originally started to get
        around filters by my school district but now hosts a whole bunch of
        projects with varying usefullness
        </p>
        <a href = "/blog">CoolElectronics's blog. Information about sh1mmer, mercury workshop, my cool projects, and some fun chromeos security writeups</a>
      </body>
    </html>
  `,
};
async function userStatusUpdate(state: App, userid: string) {
  let rooms = await state.db.getAll<Room>("Rooms");
  for (let room of rooms) {
    if (room.users.includes(userid)) {
      sendRoom(state, room);
    }
  }
}
