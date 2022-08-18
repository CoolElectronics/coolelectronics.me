import { User } from "../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "../main";

export default {
  path: "ftp",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/ftp/ftp.html");
  },
  require: {
    ftp: {},
  },
  listeners: [],
  api: [],
};
