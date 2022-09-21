import { App, error } from "../../main";
import { constructClientUser, FriendRequest, User } from "../../db";
import {
  ClientFriendRequest,
  ClientUser,
  Error,
  RequestType,
} from "../../clienttypes";
import { Request, Response } from "express";
import { randomUUID } from "crypto";
import * as Account from "./types";

export default {
  path: "account",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/account/account.html");
  },
  require: {},
  api: [
    {
      api: Account.GetSettings,
      route: async (
        state: App,
        user: User
      ): Promise<Account.GetSettingsResponse> => {
        let settings = user.settings;
        return settings;
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
      api: Account.AvaliableFriends,
      route: async (
        state: App,
        user: User
      ): Promise<Account.AvailableFriendsResponse> => {
        let users = await state.db.getAll<User>("Users");
        let clientusers: ClientUser[] = [];
        for (let usr of users) {
          if (!user.friends.includes(usr.uuid) && usr.uuid != user.uuid) {
            clientusers.push(await constructClientUser(state, usr.uuid));
          }
        }
        return clientusers;
      },
      require: {},
    },
    {
      api: Account.MyFriends,
      route: async (
        state: App,
        user: User
      ): Promise<Account.MyFriendsResponse> => {
        let clientusers: ClientUser[] = [];
        for (let friend of user.friends) {
          clientusers.push(await constructClientUser(state, friend));
        }
        return clientusers; // i could map this but whatever
      },
      require: {},
    },
    {
      api: Account.RequestFriend,
      route: async (
        state: App,
        user: User,
        body: Account.RequestFriendRequest
      ): Promise<Account.RequestFriendResponse | Error> => {
        // not the cleanest. the friends system could have definitely been done better.
        //
        if (!user.friends.includes(body.uuid)) {
          state.db.addOne("FriendRequests", {
            uuid: randomUUID(),
            from: user.uuid,
            to: body.uuid,
          });
          //send a notif
          return null;
        } else {
          return { failure: "" };
        }
      },
      require: {},
    },
    {
      api: Account.RemoveFriend,
      route: async (
        state: App,
        user: User,
        body: Account.RemoveFriendRequest
      ): Promise<Account.RemoveFriendResponse | Error> => {
        let otheruser = await state.db.getUser(body.uuid);
        if (otheruser) {
          if (user.friends.includes(body.uuid)) {
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

            return null;
          }
        }
        return error("you can't unfriend a user that you aren't friends with");
      },
      require: {},
    },
    {
      api: Account.GetFriendRequests,
      route: async (
        state: App,
        user: User
      ): Promise<Account.GetFriendRequestsResponse> => {
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
        return clientrequests;
      },
      require: {},
    },
    {
      api: Account.FriendRequestRespond,
      route: async (
        state: App,
        user: User,
        body: Account.FriendRequestRespondRequest
      ): Promise<Account.FriendRequestRespondResponse | Error> => {
        let request: FriendRequest | null = await state.db.getOne(
          "FriendRequests",
          {
            uuid: body.uuid,
          }
        );
        if (!request || request.to != user?.uuid) return error("null request");
        if (user.friends.includes(request.to)) {
          return error("already friends");
        } else {
          if (body.accept) {
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
        }
        await state.db.database.collection("FriendRequests").deleteOne({
          uuid: body.uuid,
        });
        return null;
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
      api: Account.PushSubscribe,
      route: async (
        state: App,
        user: User,
        body: Account.PushSubscribeRequest
      ): Promise<Account.PushSubscribeResponse> => {
        state.db.modifyOneProp(
          "Users",
          { uuid: user.uuid },
          "pushsubscription",
          () => body.subscription
        );
        return null;
      },
      require: {},
    },
  ],
  seopage:`
    <html>
      <head>
        <title>CoolElectronics.me | Account Settings</title>
        <meta name = "description" content = "Manage your coolelectronics.me account, add a profile picture, turn off notifications, etc">
      </head>
      <body>
        <a href = "/"></a>
        <h1>Account Settings Page</h1>
      </body>
    </html>
  `,
  listeners: [],
};
