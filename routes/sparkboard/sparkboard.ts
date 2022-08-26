import { User } from "../../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "../../main";

export default {
  path: "sparkboard",
  route: (state: App,user:User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/sparkboard/sparkboard.html");
  },
  require: {},
  listeners: [],
  api: [],
};
