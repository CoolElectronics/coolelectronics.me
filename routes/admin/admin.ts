import { App, error } from "../../main";
import { User } from "../../db";
import { Request, Response } from "express";
import * as proc from "child_process";
import axios from "axios";
import { Error, RequestType } from "../../clienttypes";

import * as Admin from "./types"

export default {
  path: "admin",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/admin/admin.html");
  },
  require: {
    Administrator: true,
  },
  api: [
    {
      path: "/powerwake",
      type: RequestType.POST,
      route: (state: App, user: User, req: Request, res: Response) => {
        proc.exec(
          `powerwake ${process.env.HOST_MAC}`,
          (err, stdout, stderr) => {
            res.send(`${err?.stack}, ${stdout}, ${stderr}`);
          }
        );
      },
      require: {
        Administrator: true,
      },
    },
    {
      path: "/startcrd",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(process.env.HOST_IP + "/api/crd");
          res.send(result.data);
        } catch (e: any) {
          res.send(e.stack);
        }
      },
      require: {
        Administrator: true,
      },
    },
    {
      path: "/stopcrd",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(process.env.HOST_IP + "/api/stopcrd");
          res.send(result.data);
        } catch (e: any) {
          res.send(e.stack);
        }
      },
      require: {
        Administrator: true,
      },
    },
    {
      path: "/startmc",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(process.env.HOST_IP + "/api/mc");
          res.send(result.data);
        } catch (e: any) {
          res.send(e.stack);
        }
      },
      require: {
        Administrator: true,
      },
    },
    {
      api:Admin.SetUserPermissions,
      route: async (state: App, user: User,body: Admin.SetUserPermissionsRequest):Promise<null | Error> => {
        await state.db.modifyOneProp(
          "Users",
          { uuid: body.uuid },
          "permissions",
          () =>body.permissions
        );
        return null;
      },
      require: { Administrator: true }
    },
    {
      api: Admin.GetAllUsers,
      require: {Administrator: true},
      route: async(state:App,user:User): Promise<Admin.GetAllUsersResponse>=>{
        return state.db.getAll("Users");
        // NOTE: this will leak hashes. it won't matter however since this is only accessible to me
      }
    }
  ],
  listeners: [],
};
