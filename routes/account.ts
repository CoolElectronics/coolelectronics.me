import { App, RequestType } from "../main";
import { constructClientUser, FriendRequest, User } from "../db";
import { ClientFriendRequest, ClientUser } from "../clienttypes";
import { Request, Response } from "express";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import busboy from "busboy";

export default {
  path: "account",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/account/account.html");
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
      path: "/availablefriends",
      type: RequestType.GET,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let users = await state.db.getAll<User>("Users");
        let clientusers: ClientUser[] = [];
        for (let usr of users) {
          if (!user.friends.includes(usr.uuid) && usr.uuid != user.uuid) {
            clientusers.push(await constructClientUser(state, usr.uuid));
          }
        }
        res.send(clientusers);
      },
      require: {},
    },
    {
      path: "/myfriends",
      type: RequestType.GET,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let clientusers: ClientUser[] = [];
        for (let friend of user.friends) {
          clientusers.push(await constructClientUser(state, friend));
        }
        res.send(clientusers);
      },
      require: {},
    },
    {
      path: "/requestfriend",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        // not the cleanest. the friends system could have definitely been done better.
        //
        let alreadyexists = false;
        let allreqs = await state.db.getAll<FriendRequest>("FriendRequests");
        for (let req of allreqs) {
          if (req.to == user.uuid || req.from == user.uuid) {
            alreadyexists = true;
          }
        }
        if (!user.friends.includes(req.body.uuid) && !alreadyexists) {
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
        let requests = await state.db.getAll<FriendRequest>("FriendRequests");
        let clientrequests: ClientFriendRequest[] = [];
        for (let request of requests) {
          if (request.from == user.uuid || request.to == user.uuid) {
            clientrequests.push({
              uuid: request.uuid,
              from: await constructClientUser(state, request.from),
              to: await constructClientUser(state, request.to),
            });
          }
        }
        res.send(clientrequests);
      },
      require: {},
    },
    {
      path: "/requestrespond",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let request: FriendRequest | null = await state.db.getOne(
          "FriendRequests",
          {
            uuid: req.body.uuid,
          }
        );
        if (request && request.to == user.uuid) {
          if (req.body.accept === "true") {
            // idk sometimes express makes it a string
            await state.db.appendToList(
              "Users",
              { uuid: request.to },
              "friends",
              request.from
            );
            await state.db.appendToList(
              "Users",
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
    {
      path: "/uploadpfp",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          if (req.files) {
            let pfp: any = req.files.file;
            if (pfp.mimetype == "image/png" || pfp.mimetype == "image/jpeg") {
              if (pfp.size < 26000000) {
                pfp.mv("./pfp/" + user.username + ".png");
                res.send({
                  status: true,
                });
              }
            } else {
              res.send({
                success: false,
                message: "unsupported image type",
              });
            }
          } else {
            res.send({
              success: false,
              message: "No file uploaded",
            });
          }
        } catch (e) {
          console.log(e);
          res.status(500).send(e);
        }
      },
      require: {
        chat: {},
      },
    },
    {
      path: "/pushworkersubscribe",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        state.db.modifyOneProp(
          "Users",
          { uuid: user.uuid },
          "pushsubscription",
          () => req.body
        );
      },
      require: {},
    },
  ],
  listeners: [],
};
