import { User } from "../../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "../../main";
import { RequestType } from "../../clienttypes";

export default {
  path: "ftp",
  route: (state: App, user: User, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/ftp/ftp.html");
    // make sure each user has a collection
  },
  require: {
    ftp: {},
  },
  listeners: [],
  api: [
    {
      path: "/uploadpfp",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        try {
          if (req.files) {
            let pfp: any = req.files.file;
            if (pfp.mimetype == "image/png" || pfp.mimetype == "image/jpeg") {
              if (pfp.size < 26000000) {
                pfp.mv("./pfp/" + user.username + ".png");
                res.send({
                  status: true,
                });
              }
            } else {
              res.send({
                success: false,
                message: "unsupported image type",
              });
            }
          } else {
            res.send({
              success: false,
              message: "No file uploaded",
            });
          }
        } catch (e) {
          console.log(e);
          res.status(500).send(e);
        }
      },
      require: {
        ftp: {
          upload:true
        },
      },
    },
  ],
};
