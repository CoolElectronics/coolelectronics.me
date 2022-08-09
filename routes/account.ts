import { App, RequestType } from "../main";
import { User } from "../db";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

export default {
  path: "/account",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.appRoot + "/dist/src/account/account.html");
  },
  require: {},
  api: [
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
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      },
      require: {},
    },
    {
      path:"/friendrequests",
      type: RequestType.GET,
      route: async (state:App,user:User,req:Request,res:Response)=>{
        let requests = await state.db.getAll("FriendRequests");
        let clientrequests: ClientFriendRequest[] = [];
        for (let request of requests){
          if (request.)
        }
      },
      require:{},
    },
    {
      path: "/requestrespond",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let request = await state.db.getOne("FriendRequests", {
          uuid: req.body.uuid,
        });
        if (request && request.requested == user.uuid) {
          if (request.accept) {
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
