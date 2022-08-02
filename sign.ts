import express, { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { RequestType, App } from "./main";
import xss from "xss";

const saltRounds = 11;
// one round more secure than the original coolelectronics.me. when i go back and rewrite this in rust, it will be 12.

export default {
  path: "/sign",
  route: (state: App, req: Request, res: Response) => {
    state.db.Validate(
      req.cookies,
      {},
      () => {
        res.redirect("/home");
      },
      () => {
        res.sendFile(__dirname + "/dist/src/sign/sign.html");
      }
    );
  },
  listeners: [],
  api: [
    {
      path: "/up",
      type: RequestType.POST,
      route: async (state: App, req, res) => {
        let username = xss(req.body.username);
        if ((await state.db.getUser(username)) != null) {
          res.send({
            success: false,
            reason: "A user with that username already exists",
          });
        } else {
          let hash = await bcrypt.hash(req.body.password, saltRounds);
          state.db.addUser(username, hash);
        }
      },
    },
    {
      path: "/in",
      type: RequestType.POST,
      route: async (state: App, req, res) => {
        console.log(req.body);
        let username = req.body.username;
        let user = await state.db.getUser(username);
        if (user) {
          let matches = await bcrypt.compare(req.body.password, user.hash);
          if (matches) {
            res.cookie("token", AuthToken(user.username), {
              maxAge: 9999990,
              httpOnly: false,
              sameSite: "strict",
            });
            res.send({
              success: true,
            });
          } else {
            res.send({
              success: false,
              reason: "incorrect password",
            });
          }
        } else {
          res.send({
            success: false,
            reason: "user does not exist",
          });
        }
      },
    },
  ],
};

function AuthToken(username: string) {
  return jwt.sign({ username }, process.env.JWT!, {
    algorithm: "HS256",
  });
}
