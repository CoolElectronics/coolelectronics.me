import { Request, Response } from "express";
import { App } from "../../main";

export default {
  path: "schedule",
  route: (state:App, req: Request, res: Response) => {
        res.sendFile(global.rootDir + "/dist/src/schedule/schedule.html");
  },
  listeners: [],
  api: [
  ],
};
