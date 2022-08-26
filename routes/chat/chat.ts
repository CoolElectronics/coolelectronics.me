import { ChatMessage, constructClientUser, Room, User } from "../../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, CachedUser, error, parse } from "../../main";
import xss from "xss";
import { randomUUID } from "crypto";
import {
  ClientRoom,
  ClientChatMessage,
  ClientUser,
  MESSAGES_PER_PAGE,
  RequestType,
  Error,
} from "../../clienttypes";
import webpush from "web-push";
import * as Chat from "./types";
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

            for (let userid of room.users) {
              let cached: [Socket | null, CachedUser] | null =
                state.usercache.getVal(userid);
              if (cached && cached[0]) {
                cached[0].emit("chat:newmessage", {
                  msg: clientmsg,
                  room: room.uuid,
                });
              } else {
                let usrinroom: User = (await state.db.getUser(userid)) as User;
                if (usrinroom.pushsubscription) {
                  webpush
                    .sendNotification(
                      usrinroom.pushsubscription,
                      JSON.stringify({
                        title: user.username,
                        body: message.message,
                      })
                    )
                    .catch(() => {
                      console.log("unsubscription or error when pushing");
                      state.db.modifyOneProp(
                        "Users",
                        { uuid: user.uuid },
                        "pushsubscription",
                        () => null
                      );
                    });
                } else {
                  console.log("no worker :sad:");
                }
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
      api: Chat.Fetch,
      require: {
        chat: {},
      },
      route: async (
        state: App,
        user: User,
        body: Chat.FetchRequest
      ): Promise<Chat.FetchResponse | Error> => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: body.id,
        });
        if (!room) return error("null room");
        if (!room.users.includes(user.uuid)) return error("not in room");

        let start = room.messages.length - body.page * MESSAGES_PER_PAGE;
        if (start < 0) start = 0;

        let clientmessages: ClientChatMessage[] = await Promise.all(
          room.messages
            .slice(start - MESSAGES_PER_PAGE, start)
            .map(async (msg) => {
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
                throw 0;
              }
            })
        );
        return clientmessages;
      },
    },
    {
      api: Chat.NewRoom,
      require: {
        chat: {},
        trusted: true,
      },
      route: async (
        state: App,
        user: User,
        body: Chat.NewRoomRequest
      ): Promise<Chat.NewRoomResponse | Error> => {
        let sanitizedname = xss(body.name).normalize();
        if (sanitizedname == "" || sanitizedname == null)
          return error("bad name");

        let room: Room = {
          name: sanitizedname,
          owner: user.uuid,
          users: [user.uuid],
          messages: [],
          public: body.public,
          uuid: randomUUID(),
        };
        await state.db.addOne("Rooms", room);
        let clientroom = await constructClientRoom(state, room);
        return clientroom;
      },
    },
    {
      api: Chat.FetchPublic,
      require: {
        chat: {},
      },
      route: async (
        state: App,
        user: User
      ): Promise<Chat.FetchPublicResponse | Error> => {
        let rooms: Room[] = await state.db.getAll<Room>("Rooms");
        let clientrooms: ClientRoom[] = [];
        for (let room of rooms) {
          if (room.public && !room.users.includes(user.uuid)) {
            let clientroom = await constructClientRoom(state, room);
            clientrooms.push(clientroom);
          }
        }
        return clientrooms;
      },
    },
    {
      api: Chat.JoinPublic,
      require: {
        chat: {},
      },

      route: async (
        state: App,
        user: User,
        body: Chat.JoinPublicRequest
      ): Promise<Chat.JoinPublicResponse | Error> => {
        let room: Room | null = await state.db.getOne<Room>("Rooms", {
          uuid: body.uuid,
        });
        if (!room) return error("null room");
        if (!room.public || room.users.includes(user.uuid))
          return error("room cannot be joined");
        await joinRoom(state, user, room);
        return null;
      },
    },
    {
      api: Chat.InviteUser,
      require: {
        chat: {},
      },
      route: async (
        state: App,
        user: User,
        body: Chat.InviteUserRequest
      ): Promise<Chat.InviteUserResponse | Error> => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: body.room,
        });
        if (!room) return error("room does not exist");
        if (user.uuid != room.owner) return error("insufficient permissions");
        if (!room.users.includes(user.uuid) || room.users.includes(body.user))
          return error("you aren't in this room or they are");
        let invited = await state.db.getUser(body.user);
        if (!(invited && user.friends.includes(invited.uuid)))
          return error("you aren't friends with that user");
        await state.db.appendToList(
          "Rooms",
          { uuid: room.uuid },
          "users",
          invited.uuid
        );
        room = await state.db.getOne("Rooms", { uuid: body.user })!;
        sendRoom(state, room!);
        return null;
      },
    },
    {
      api: Chat.RemoveUser,
      require: {
        chat: {},
      },
      route: async (
        state: App,
        user: User,
        body: Chat.RemoveUserRequest
      ): Promise<Chat.RemoveUserResponse | Error> => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: body.room,
        });
        if (!room) return error("null room");
        if (!(room.users.includes(user.uuid) && room.users.includes(body.user)))
          return error("not in room");
        let removed = await state.db.getUser(body.user);
        if (!removed) return error("bad request");
        await state.db.removeFromList(
          "Rooms",
          { uuid: room.uuid },
          "users",
          removed.uuid
        );
        room = await state.db.getOne("Rooms", { uuid: body.room });
        sendRoom(state, room!);
        // sendroom won't send it to the removed user because they aren't in the room anymore
        let cachedremoved: [Socket | null, CachedUser] | null =
          state.usercache.getVal(removed.uuid);
        if (cachedremoved && cachedremoved[0]) {
          sendRooms(state, removed.uuid, cachedremoved[0]);
        }
        return null;
      },
    },
    {
      api: Chat.InvitableUsers,
      require: {
        chat: {},
      },
      // gets all friends not already in room x
      route: async (
        state: App,
        user: User,
        body: Chat.InvitableUsersRequest
      ): Promise<Chat.InvitableUsersResponse | Error> => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: body.room,
        });
        if (!room) return error("null room");
        let clientusers: ClientUser[] = [];
        for (let userid of user.friends) {
          if (!room.users.includes(userid)) {
            let clientuser = await constructClientUser(state, userid);
            clientusers.push(clientuser);
          }
        }
        return clientusers;
      },
    },
    {
      api: Chat.ChangeRoomSettings,
      require: {
        chat: {},
      },
      route: async (
        state: App,
        user: User,
        body: Chat.ChangeRoomSettingsRequest
      ): Promise<Chat.ChangeRoomSettingsResponse | Error> => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: body.room,
        });
        if (!room) return error("null room");
        if (user.uuid == room.owner) return error("insufficient permissions");
        let sanitizedname = xss(body.name).normalize();
        if (sanitizedname == "") return error("bad name");
        await state.db.modifyOne("Rooms", { uuid: room.uuid }, (room) => {
          room.name = sanitizedname;
          room.public = body.public;
        });
        await sendRoom(state, room);
        return null;
      },
    },
    {
      api: Chat.DeleteRoom,
      require: {
        chat: {},
      },
      route: async (
        state: App,
        user: User,
        body: Chat.DeleteRoomRequest
      ): Promise<Chat.DeleteRoomResponse | Error> => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: body.room,
        });
        if (!room) return error("null room");
        if (user.uuid != room.owner) return error("insufficient permissions");
        await state.db.database.collection("Rooms").deleteOne({
          uuid: body.room,
        });
        for (let eachuser of room.users) {
          let cached: [Socket | null, CachedUser] | null =
            state.usercache.getVal(eachuser);
          if (cached && cached[0]) {
            sendRooms(state, eachuser, cached[0]);
          }
        }
        return null;
      },
    },
    {
      api: Chat.LeaveRoom,
      require: {
        chat: {},
      },
      route: async (
        state: App,
        user: User,
        body: Chat.LeaveRoomRequest
      ): Promise<Chat.LeaveRoomResponse | Error> => {
        let room: Room | null = await state.db.getOne("Rooms", {
          uuid: body.room,
        });
        if (!room) return error("null room");
        if (!room.users.includes(user.uuid)) return error("not in room");
        await state.db.removeFromList(
          "Rooms",
          { uuid: room.uuid },
          "users",
          user.uuid
        );
        room = await state.db.getOne("Rooms", { uuid: body.room });
        if (room!.users.length > 0) {
          sendRoom(state, room!);
          // sendroom won't send it to the removed user because they aren't in the room anymore
          let cachedremoved: [Socket | null, CachedUser] | null =
            state.usercache.getVal(user.uuid);
          if (cachedremoved && cachedremoved[0]) {
            sendRooms(state, user.uuid, cachedremoved[0]);
          }
        } else {
          await state.db.database.collection("Rooms").deleteOne({
            uuid: body.room,
          });
        }
        return null;
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
export async function sendRoom(state: App, room: Room) {
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
