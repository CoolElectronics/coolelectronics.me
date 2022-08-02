import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "./main";

export default {
  path: "/home",
  route: (state: App, req: Request, res: Response) => {
        res.sendFile(__dirname + "/dist/src/home/home.html");
  },
  require: {},
  listeners: [],
  api: [],
};
