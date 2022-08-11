import { ChatMessage, Room, User } from "../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, CachedUser, parse, RequestType } from "../main";
import xss from "xss";
import { randomUUID } from "crypto";
import { ClientRoom, ClientChatMessage } from "../clienttypes";

export default {
  path: "chat",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/chat/chat.html");
  },
  require: {
    chat: {},
  },
  listeners: [
    {
      path: "connected",
      route: async (state: App, user: User, req, socket: Socket) => {
        sendRooms(state, user, socket);
      },
      require: { chat: {} },
    },
    {
      path: "send",
      route: async (state: App, user: User, req) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.id,
        });
        if (room != null) {
          // console.log("sen")
          // i check null right here
          let sanitized = xss(req.message).normalize();
          if (sanitized != "") {
            let message: ChatMessage = {
              sender: user.uuid,
              uuid: randomUUID(),
              message: sanitized,
              timestamp: new Date(),
            };
            state.db.appendToList(
              "Rooms",
              {
                uuid: req.id,
              },
              "messages",
              message
            );

            let clientmsg: ClientChatMessage = Object.assign(
              {},
              message
            ) as ClientChatMessage;
            clientmsg.sendername = user.username;

            for (let user of room.users) {
              let cached: [Socket | null, CachedUser] | null =
                state.usercache.getVal(user);
              if (cached && cached[0]) {
                cached[0].emit("chat:newmessage", {
                  msg: clientmsg,
                  room: room.uuid,
                });
              } else {
                // add it to the notifs or whatever
              }
            }
          }
        }
      },
      require: {
        chat: {},
      },
    },
  ],
  api: [
    {
      path: "/fetch",
      type: RequestType.POST,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.body.id,
        });
        if (room) {
          // null check
          if (room.users.includes(user.uuid)) {
            let clientmessages = await Promise.all(
              room.messages.map(async (msg) => {
                let usr = await state.db.getUser(msg.sender);
                if (usr) {
                  let newmsg: ClientChatMessage = {
                    uuid: msg.uuid,
                    sender: msg.sender,
                    timestamp: msg.timestamp,
                    sendername: usr.username,
                    roomuuid: room!.uuid,
                    message: msg.message,

                    sent: true,
                  };
                  return newmsg;
                } else {
                  console.error("unreachable state or deleted user");
                }
              })
            );
            res.send(clientmessages);
          }
        } else {
          console.log("invalid room or smth");
        }
      },
    },
    {
      path: "/newroom",
      type: RequestType.POST,
      require: {
        chat: {},
        trusted: true,
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let sanitizedname = xss(req.body.name).normalize();
        if (sanitizedname != "" && sanitizedname != null) {
          let room: Room = {
            name: req.body.name,
            owner: user.uuid,
            users: [user.uuid],
            messages: [],
            public: req.body.public === "true",
            uuid: randomUUID(),
          };
          await state.db.addOne("Rooms", room);
          let clientroom = await constructClientRoom(state, room);
          res.send(clientroom);
        }
      },
    },
    {
      path: "/fetchpublic",
      type: RequestType.GET,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let rooms: Room[] = await state.db.getAll<Room>("Rooms");
        let clientrooms: ClientRoom[] = [];
        for (let room of rooms) {
          if (room.public && !room.users.includes(user.uuid)) {
            let clientroom = await constructClientRoom(state, room);
            clientrooms.push(clientroom);
          }
        }
        res.send(clientrooms);
      },
    },
    {
      path: "/joinpublic",
      type: RequestType.POST,
      require: {
        chat: {},
      },

      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne<Room>("Rooms", {
          uuid: req.body.uuid,
        });
        if (room && room.public && !room.users.includes(user.uuid)) {
          await joinRoom(state, user, room);
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      },
    },
    {
      path: "/inviteuser",
      type: RequestType.POST,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.body.roomuuid,
        });
        if (
          room &&
          room.users.includes(user.uuid) &&
          !room.users.includes(req.body.invited)
        ) {
          let invited = await state.db.getUser(req.body.useruuid);
          if (invited && user.friends.includes(invited.uuid)) {
            await state.db.appendToList(
              "Rooms",
              { uuid: room.uuid },
              "users",
              invited.uuid
            );
            sendRoom(state, room);
            res.sendStatus(200);
            return;
          }
        }
        res.sendStatus(400);
      },
    },
  ],
};
async function joinRoom(state: App, user: User, room: Room) {
  if (!room.users.includes(user.uuid)) {
    state.db.appendToList(
      "Rooms",
      {
        uuid: room.uuid,
      },
      "users",
      user.uuid
    );
    sendRoom(state, room);
  }
}
// really awful name, but this sends the roomlist to all users, not just one socket
async function sendRoom(state: App, room: Room) {
  for (let userid of room.users) {
    let socket: Socket | null = state.usercache.getVal(userid)?.[0]!;
    if (socket) {
      let user = await state.db.getUser(userid)!;
      sendRooms(state, user!, socket);
    }
  }
}
async function sendRooms(state: App, user: User, socket: Socket) {
  let rooms: Room[] = await state.db.getAll<Room>("Rooms");
  let clientrooms: ClientRoom[] = [];
  for (let room of rooms) {
    if (room.users.includes(user.uuid)) {
      let clientroom = await constructClientRoom(state, room);
      clientrooms.push(clientroom);
    }
  }
  socket.emit("chat:rooms", clientrooms);
}

async function constructClientRoom(
  state: App,
  room: Room
): Promise<ClientRoom> {
  let clientroom: ClientRoom = {
    uuid: room.uuid,
    name: room.name,
    owner: room.owner,
    users: await Promise.all(
      room.users.map(async (u) => {
        let user = await state.db.getUser(u)!;
        let online = false;

        let cached: [Socket | null, CachedUser] | null =
          state.usercache.getVal(u);
        if (cached && cached[1].online) {
          online = true;
        }
        return {
          name: user!.username,
          online,
          uuid:user!.uuid,
        };
      })
    ),
    public: room.public,
  };
  return clientroom;
}
