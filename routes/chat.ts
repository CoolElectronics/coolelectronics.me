import { ChatMessage, constructClientUser, Room, User } from "../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, CachedUser, parse, RequestType } from "../main";
import xss from "xss";
import { randomUUID } from "crypto";
import { ClientRoom, ClientChatMessage, ClientUser } from "../clienttypes";

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
        sendRooms(state, user.uuid, socket);
      },
      require: { chat: {} },
    },
    {
      path: "send",
      route: async (state: App, user: User, req) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.id,
        });
        if (room != null && room.users.includes(user.uuid)) {
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
            name: sanitizedname,
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
          uuid: req.body.uuid,
        });
        // console.log("here");
        if (
          room &&
          user.uuid == room.owner &&
          room.users.includes(user.uuid) &&
          !room.users.includes(req.body.invited)
        ) {
          // console.log("room exists");
          let invited = await state.db.getUser(req.body.invited);
          if (invited && user.friends.includes(invited.uuid)) {
            // console.log("invitied ixists");
            await state.db.appendToList(
              "Rooms",
              { uuid: room.uuid },
              "users",
              invited.uuid
            );
            room = await state.db.getOne("Rooms", { uuid: req.body.uuid })!;
            sendRoom(state, room!);
            res.sendStatus(200);
            return;
          }
        }
        res.sendStatus(400);
      },
    },
    {
      path: "/removeuser",
      type: RequestType.POST,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.body.uuid,
        });
        if (
          room &&
          room.users.includes(user.uuid) &&
          room.users.includes(req.body.user)
        ) {
          let removed = await state.db.getUser(req.body.user);
          if (removed) {
            await state.db.removeFromList(
              "Rooms",
              { uuid: room.uuid },
              "users",
              removed.uuid
            );
            room = await state.db.getOne("Rooms", { uuid: req.body.uuid });
            sendRoom(state, room!);
            // sendroom won't send it to the removed user because they aren't in the room anymore
            let cachedremoved: [Socket | null, CachedUser] | null =
              state.usercache.getVal(removed.uuid);
            if (cachedremoved && cachedremoved[0]) {
              sendRooms(state, removed.uuid, cachedremoved[0]);
            }
            res.sendStatus(200);
            return;
          }
        }
        res.sendStatus(400);
      },
    },
    {
      path: "/invitablefriends",
      type: RequestType.POST,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.body.uuid,
        });
        if (room) {
          let clientusers: ClientUser[] = [];
          for (let userid of user.friends) {
            if (!room.users.includes(userid)) {
              let clientuser = await constructClientUser(state, userid);
              clientusers.push(clientuser);
            }
          }
          res.send(clientusers);
          return;
        }
        res.sendStatus(400);
      },
    },
    {
      path: "/changeroomsettings",
      type: RequestType.POST,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.body.uuid,
        });
        if (room && user.uuid == room.owner) {
          let sanitizedname = xss(req.body.name).normalize();
          if (sanitizedname != "") {
            await state.db.modifyOne("Rooms", { uuid: room.uuid }, (room) => {
              room.name = sanitizedname;
              room.public = req.body.public;
            });
            await sendRoom(state, room);
            res.sendStatus(200);
            return;
          }
        }
        res.sendStatus(400);
      },
    },
    {
      path: "/deleteroom",
      type: RequestType.POST,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.body.uuid,
        });
        if (room && user.uuid == room.owner) {
          await state.db.database.collection("Rooms").deleteOne({
            uuid: req.body.uuid,
          });
          for (let eachuser of room.users) {
            let cached: [Socket | null, CachedUser] | null =
              state.usercache.getVal(eachuser);
            if (cached && cached[0]) {
              sendRooms(state, eachuser, cached[0]);
            }
          }
        }
      },
    },
    {
      path: "/leaveroom",
      type: RequestType.POST,
      require: {
        chat: {},
      },
      route: async (state: App, user: User, req: Request, res: Response) => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: req.body.uuid,
        });
        if (room && room.users.includes(user.uuid)) {
          await state.db.removeFromList(
            "Rooms",
            { uuid: room.uuid },
            "users",
            user.uuid
          );
          room = await state.db.getOne("Rooms", { uuid: req.body.uuid });
          sendRoom(state, room!);
          // sendroom won't send it to the removed user because they aren't in the room anymore
          let cachedremoved: [Socket | null, CachedUser] | null =
            state.usercache.getVal(user.uuid);
          if (cachedremoved && cachedremoved[0]) {
            sendRooms(state, user.uuid, cachedremoved[0]);
          }
          res.sendStatus(200);
          return;
        }
        res.sendStatus(400);
      },
    },
  ],
};
async function joinRoom(state: App, user: User, room: Room) {
  if (!room.users.includes(user.uuid)) {
    await state.db.appendToList(
      "Rooms",
      {
        uuid: room.uuid,
      },
      "users",
      user.uuid
    );
    let nroom = await state.db.getOne<Room>("Rooms", { uuid: room.uuid });
    sendRoom(state, nroom!);
  }
}
// really awful name, but this sends the roomlist to all users in a room, not just one socket
async function sendRoom(state: App, room: Room) {
  for (let userid of room.users) {
    let socket: Socket | null = state.usercache.getVal(userid)?.[0]!;
    if (socket) {
      sendRooms(state, userid, socket);
    } else {
    }
  }
}
async function sendRooms(state: App, userid: string, socket: Socket) {
  let rooms: Room[] = await state.db.getAll<Room>("Rooms");
  let clientrooms: ClientRoom[] = [];
  for (let room of rooms) {
    if (room.users.includes(userid)) {
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
          uuid: user!.uuid,
        };
      })
    ),
    public: room.public,
  };
  return clientroom;
}
