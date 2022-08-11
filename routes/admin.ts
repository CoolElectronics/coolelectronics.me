import { App, RequestType } from "../main";
import { User } from "../db";
import { Request, Response } from "express";
import * as proc from "child_process";
import axios from "axios";

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
      path: "/updateuserpermissions",
      type: RequestType.POST,
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
