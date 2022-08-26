import { Request, Response } from "express";
import { App } from "../../main";

export default {
  path: "playground",
  route: (state: App, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/playground/playground.html");
  },
  listeners: [],
  api: []
}
