import { User } from "../../db";
import express, { Application, Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "../../main";
import { RequestType } from "../../clienttypes";
import * as Ftp from "./types";
import xss from "xss";
import { randomUUID } from "crypto";

let invchars = ["​","‌","‍","⁠"];

function init(state:App,app:Application){

}

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
      api: Ftp.CreateFile,
      require: {
        ftp: {
          upload: true,
        },
      },
      route: async (
        state: App,
        user: User,
        body: Ftp.CreateFileRequest
      ): Promise<Ftp.CreateFileResponse> => {
        let file: File = {
          uuid: randomUUID(),
          url: body.url.normalize(),
          visibility: body.visibility,
          name: body.name.normalize(),
          filepath: null,
          viewedtimes: 0,
          owner: user.uuid,
          ips: [],
        };

        await state.db.modifyOneProp(
          "Users",
          { uuid: user.uuid },
          "files",
          (f) => [...f, file]
        );

        return constructClientFile(file);
      },
    },
    // {
    //   api:Ftp.EditFile,
    //   require:{
    //     ftp:{
    //       upload:true,
    //     }
    //   }
    // },
    {
      path: "/upload",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        state.db.modifyOne("Users", { uuid: user.uuid }, (user) => {
          let file:File = user.files.find(f=>f.uuid == req.body.uuid); 
          if (!file) return;
          try {
            if (req.files) {
              let file: any = req.files.file;
              if (file.mimetype == "image/png" ||file.mimetype == "image/jpeg") {
                  file.mv("./ftp/" +  + ".png");
                  res.send({
                    status: true,
                  });
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
        });

      },
      require: {
        ftp: {
          upload: true,
        },
      },
    },
  ],
};

function constructClientFile(file: File): Ftp.ClientFile {
  return {
    name:file.name,
    uuid: file.uuid,
    url: file.url,
    viewedtimes: file.viewedtimes,
    ips: file.ips,
  };
}

export interface File {
  uuid: string;
  owner: string;
  name: string;
  visibility: Ftp.FileVisibility;
  url: string;
  filepath: string | null;
  viewedtimes: number;
  ips: string[];
}
