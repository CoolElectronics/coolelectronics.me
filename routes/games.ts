import { User } from "../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "../main";

export default {
  path: "games",
  route: (state: App, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/games/games.html");
  },
  listeners: [],
  api: [],
};
