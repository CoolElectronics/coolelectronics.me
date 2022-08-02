import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { noop } from "svelte/internal";
import { App, parse, RequestType } from "./main";
import { User } from "./db";

export function socketConnect(state: App, socket: Socket) {
  let cookies = parse(socket.request.headers.cookie);
  state.db.Validate(
    cookies,
    {},
    (user) => {},
    () => {},
    () => {}
  );
}

export default {
  path: "/",
  route: (state: App, req: Request, res: Response) => {
    state.db.Validate(
      req.cookies,
      {},
      () => {
        res.redirect("/home");
      },
      () => {
        res.sendFile(__dirname + "/dist/src/index.html");
      }
    );
  },
  listeners: [],
  api: [
    {
      path: "me",
      type: RequestType.GET,
      route: (state: App, req, res) => {
        state.db.Validate(
          req.cookies,
          {},
          (user: User) => {
            res.status(200).send({
              username: user.username,
              permissions: user.permissions,
            });
          },
          () => {
            res.status(401).send("you aren't signed in? how exactly...");
            console.error("smthing happened here");
          }
        );
      },
    },
  ],
};
