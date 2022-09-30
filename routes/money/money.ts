import { Request, Response } from "express";
import { App } from "../../main";


export default {
  path: "money",
  route: (state:App, req: Request, res: Response) => {
        res.sendFile(global.rootDir + "/dist/src/money/money.html");
  },
  listeners: [],
  api: [
  ],
};
