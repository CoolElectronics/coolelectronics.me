import { App } from "../main";
import { User } from "../db";
import { Request, Response } from "express";
import * as proc from "child_process";
import axios from "axios";

export default {
  path: "/admin",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.appRoot + "/dist/src/admin/admin.html");
  },
  require: {
    Administrator: true,
  },
  api: [
    {
      path: "/powerwake",
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
      path: "/startmc",
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
      path: "/updateuserpermissions",
      route: async (state: App, user: User, req: Request, res: Response) => {
        await state.db.modifyOneProp(
          "Users",
          { uuid: user.uuid },
          "permissions",
          () => req.body.permissions
        );
      },
      require: { Administrator: true },
    },
  ],
  listeners: [],
};
