import { App, error } from "../../main";
import { User } from "../../db";
import { Request, Response } from "express";
import * as proc from "child_process";
import axios from "axios";
import { Error, RequestType } from "../../clienttypes";

import * as Admin from "./types";
import { createProxyMiddleware } from "http-proxy-middleware";

var devProxy: Function | null;

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
      path: "/test",
      type: RequestType.GET,
      route: (state: App, user, req, res) => {
        res.send(200);
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
      path: "/novnc",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(process.env.HOST_IP + "/api/novnc", {
            port: req.body.port,
          });
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
      path: "/restartreemo",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(
            process.env.HOST_IP + "/api/restartreemo",
            {
              port: req.body.port,
            }
          );
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
      path: "/servecode",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(
            process.env.HOST_IP + "/api/servecode",
            {
              port: req.body.port,
            }
          );
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
      path: "/startx11vnc",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(
            process.env.HOST_IP + "/api/startx11vnc"
          );
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
      path: "/startx",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(process.env.HOST_IP + "/api/startx");
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
      path: "/killnovnc",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          let result = await axios.post(process.env.HOST_IP + "/api/killnovnc");
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
          let result = await axios.post(process.env.HOST_IP + "/api/startx");
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
      api: Admin.SetUserPermissions,
      route: async (
        state: App,
        _: User,
        body: Admin.SetUserPermissionsRequest
      ): Promise<null | Error> => {
        await state.db.modifyOneProp(
          "Users",
          { uuid: body.uuid },
          "permissions",
          () => body.permissions
        );
        return null;
      },
      require: { Administrator: true },
    },
    {
      api: Admin.GetAllUsers,
      require: { Administrator: true },
      route: async (
        state: App,
      ): Promise<Admin.GetAllUsersResponse> => {
        return state.db.getAll("Users");
        // NOTE: this will leak hashes. it won't matter however since this is only accessible to me
      },
    },
    {
      api: Admin.StartDevServer,
      require: { Administrator: true },
      route: async (
        state: App,
        _: User,
        body: Admin.StartDevSeverRequest
      ): Promise<Error | null> => {
        let requireCheck = async (
          _:any,
          req: Request,
          res: Response,
        ) => {
          state.db.Validate(
            req.cookies,
            body.require == 1 ? { chat: {} } : { Administrator: true },
            () => {},
            () => res.send("forbidden")
          );
        };
        let plugin = (proxyServer) => {
          proxyServer.on("proxyReq",requireCheck);
        };
        devProxy = createProxyMiddleware({
          target: `http://10.0.1.65:${body.port}`,
          ws: true,
          plugins: body.require == 0 ? [] : [plugin],
        });
        return null;
      },
    },
    {
      api: Admin.StopDevServer,
      require: {Administrator:true},
      route: ()=>{
       devProxy = null; 
      }
    }
  ],
  listeners: [],
};

export function getDevProxy(req,res,next): any {
  if (devProxy){
    devProxy(req,res,next)
  }else{
    res.send("development tunnel not running")
  }
}
