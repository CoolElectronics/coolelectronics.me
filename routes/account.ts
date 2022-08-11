import { App, RequestType } from "../main";
import { User } from "../db";
import { ClientFriendRequest } from "../clienttypes";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

export default {
  path: "account",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.appRoot + "/dist/src/account/account.html");
  },
  require: {},
  api: [
    {
      path: "/getsettings",
      type: RequestType.GET,
      route: (state: App, user: User, req: Request, res: Response) => {
        let settings = user.settings;
        res.send(settings);
      },
      require: {},
    },
    {
      path: "/storesettings",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        await state.db.modifyOneProp(
          "Users",
          { uuid: user.uuid },
          "settings",
          () => req.body.settings
        );
        res.sendStatus(200);
      },
      require: {},
    },
    {
      path: "/requestfriend",
      type: RequestType.POST,
      route: (state: App, user: User, req: Request, res: Response) => {
        if (!user.friends.includes(req.body.uuid)) {
          state.db.addOne("FriendRequests", {
            uuid: randomUUID(),
            from: user.uuid,
            to: req.body.uuid,
          });
          //send a notif
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      },
      require: {},
    },
    {
      path: "/removefriend",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let otheruser = await state.db.getUser(req.body.uuid);
        if (otheruser) {
          if (user.friends.includes(req.body.uuid)) {
            state.db.removeFromList(
              "Users",
              { uuid: user.uuid },
              "friends",
              otheruser.uuid
            );
            state.db.removeFromList(
              "Users",
              { uuid: otheruser.uuid },
              "friends",
              user.uuid
            );

            res.sendStatus(200);
            return;
          }
        }
        res.sendStatus(400);
      },
      require: {},
    },
    {
      path: "/friendrequests",
      type: RequestType.GET,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let requests = await state.db.getAll("FriendRequests");
        let clientrequests: ClientFriendRequest[] = [];
        for (let request of requests) {
          if (request.from == user.uuid || request.to == user.uuid) {
            clientrequests.push({
              uuid: request.uuid,
              from: request.from,
              to: request.to,
            });
          }
        }
      },
      require: {},
    },
    {
      path: "/requestrespond",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let request: ClientFriendRequest | null = await state.db.getOne(
          "FriendRequests",
          {
            uuid: req.body.uuid,
          }
        );
        if (request && request.to == user.uuid) {
          if (req.body.accept) {
            await state.db.appendToList(
              "User",
              { uuid: request.to },
              "friends",
              request.from
            );
            await state.db.appendToList(
              "User",
              { uuid: request.from },
              "friends",
              request.to
            );
            // also send a notif or 2
          } else {
            // send denied notif
          }
          await state.db.database.collection("FriendRequests").deleteOne({
            uuid: req.body.uuid,
          });
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      },
      require: {},
    },
  ],
  listeners: [],
};
