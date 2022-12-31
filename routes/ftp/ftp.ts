import { User } from "../../db";
import express, { Application, Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "../../main";
import { Failure, RequestType } from "../../clienttypes";
import * as Ftp from "./types";
import xss from "xss";
import { randomUUID } from "crypto";

let invchars = ["​", "‌", "‍", "⁠"];

export function startFtp(state: App, ftpApp: Application) {
  ftpApp.use("/raw", async (req: Request, res: Response) => {
    let file = await getFileFromUrl(state, req.url.substring(1));
    if (file) {
      if (file.visibility == Ftp.FileVisibility.PRIVATE) {
        state.db.Validate(
          req.cookies,
          {},
          (user: User) => {
            if (user.uuid == file!.owner) {
              res.sendFile(global.rootDir + "/ftp/" + file?.uuid);
            }
          },
          () => res.sendStatus(403),
        );
      } else {
        res.sendFile(global.rootDir + "/ftp/" + file?.uuid);
      }
    } else {
      res.sendStatus(404);
    }
  });
  ftpApp.use(async (req: Request, res: Response) => {
    let file = await getFileFromUrl(state, req.url.substring(1));
    if (file && file.visibility == Ftp.FileVisibility.PRIVATE) {
      state.db.Validate(
        req.cookies,
        {},
        (user: User) => {
          if (user.uuid == file!.owner) {
            res.render("file.ejs", { file });
          }
        },
        () => res.sendStatus(403),
      );
    } else {
      res.render("file.ejs", { file });
    }
  });
}
function constructDoc(req: Request, file: Ftp.File | null, url: string) {
  return `<!DOCTYPE html>
  <html lang="en-us">

  <head>
      <title>amogus hosting</title>

      <meta name="robots" content="noindex, follow">
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
      <meta name="viewport" content="width=device-width, user-scalable=1, initial-scale=1.0">
      <meta name="robots" content="noindex, follow">
      <meta property="og:site_name" content="coolelectronics's random shit">
      <meta property="og:url" content="${file ? xss(file.url) : url}">
      <meta property="og:title" content="${file ? xss(file.name) : "404"}">
      <meta property="og:description" content="${file ? (xss(file.description) + (file.type == Ftp.FileType.RAW ? " click to download" : " ")) : "get your urls right"}">
      <meta name="theme-color" content="#4c3e51">
      ${file ? constructMeta(file) : ""}
  </head>



  <body>
    ${file ? constructBody(req, file) : ""}
  </body>

  <style>
      .nopad {
          margin: 0px !important;
          padding: 0px !important;
      }
      :root {
          --m-font: Assistant;
          --m-main-fg: #d9d9d9;
          --m-alt-fg: #bfbfbf;
          --m-alt-alt-fg: #a6a6a6;
          --m-inner-gaps-px: 5px;
          --m-font-fg: #0d0d0d;
          --m-gaps-px: 10px;
          --m-container-transparency: 94%;
          --m-container-radius: 10px;
      }
      .fa {
          width: 4%;
          cursor: pointer;
          height: auto;
          color: var(--m-font-fg);
      }
      html,
      body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: var(--m-main-fg);
      }
      #main-container {
          width: calc(100% - var(--m-inner-gaps-px)*4);
          height: calc(100% - var(--m-inner-gaps-px)*4);
          background-color: var(--m-alt-fg);
          display: flex;
          align-items: center;
          justify-content: center;
      }
      .c2 {
          background-color: var(--m-alt-alt-fg);
          border: 10px solid var(--m-alt-alt-fg);
      }
      .con
          position: relative;
          border-radius: var(--m-container-radius);
      }
  </style>

  </html>`;
}

function constructBody(req, file: Ftp.File) {
  return ``;
}
function constructView(req: Request, file: Ftp.File) {
  console.log(req);
  switch (file.type) {
    case Ftp.FileType.IMAGE:
      return `image`;
    case Ftp.FileType.VIDEO:
      return `video`;
    case Ftp.FileType.RAW:
      return `<a href = "/raw/${file.url}">download</a>`
  }
}

function constructMeta(file: Ftp.File) {
  switch (file.type) {
    case Ftp.FileType.IMAGE:
      return `<meta property="og:image" content="https://i.coolelectronics.me/raw/${file.url}"/>
              <meta property="twitter:card" content="summary_large_image">
              <meta name="twitter:card" content="summary_large_image">
              <meta name="twitter:image" content="https://i.coolelectronics.me/raw/${file.url}">
              <meta property="og:type" content="image">`;
    case Ftp.FileType.VIDEO:
      return `<meta property="og:video" content="https://i.coolelectronics.me/raw/${file.url}"/>
      <meta property="og:type" content="video">`;
    default: return "";
  }
}

function getFileFromUrl(state: App, url: string): Promise<Ftp.File | null> {
  let isSpecial = isSpecialURL(url);
  console.log(isSpecial);
  console.log(url);
  if (isSpecial) {
    return state.db.getOne<Ftp.File>("Ftp", {
      num: specialDecode(url),
    })
  } else {

    return state.db.getOne<Ftp.File>("Ftp", {
      url
    })
  }
}
function isSpecialURL(url: string) {
  for (let invchar of invchars) {
    if (url.includes(invchar)) return true;
  }
  return false;
}
function specialEncode(num: number) {
  let str = "";
  while (num > 0) {
    str = invchars[Math.floor(num % invchars.length)] + str;
    num = Math.floor(num / invchars.length)
  }
  return str
}
function specialDecode(str: string) {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    // console.log(invchars.indexOf(str[i]))
    num += invchars.indexOf(str[i]) * invchars.length ** i
  }
  return num
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
        let existingFile = await state.db.getOne("Ftp", { url: body.url });
        if (existingFile) {
          return {
            failure: "choose another url"
          }
        }


        let number = (await state.db.getAll("Ftp")).length;

        console.log(body);
        let file: Ftp.File = {
          uuid: randomUUID(),
          url: body.url.normalize(),
          visibility: body.visibility,
          name: body.name.normalize(),
          owner: user.uuid,
          num: number + 1,//+1 so that an encoding of "" is an impossible state
          description: body.description.normalize(),
          type: body.type,
        };

        await state.db.modifyOneProp(
          "Users",
          { uuid: user.uuid },
          "files",
          (f) => [...f, file.uuid]
        );
        await state.db.addOne("Ftp", file);

        return constructClientFile(file);
      },
    },
    {
      api: Ftp.GetFiles,
      route: async (state: App, user: User): Promise<Ftp.GetFilesResponse> => {
        let files = await state.db.database.collection("Ftp").find<Ftp.File>({ owner: user.uuid }).toArray();
        return files.map(constructClientFile);
      },
      require: {},
    },
    {
      api: Ftp.EditFile,
      route: async (
        state: App,
        user: User,
        body: Ftp.EditFileRequest
      ): Promise<Failure | undefined> => {
        let file = await state.db.getOne<Ftp.File>("Ftp", { uuid: body.uuid });
        if (!file || file.owner != user.uuid) return { failure: "Forbidden" };
        if (file.url != body.url) {
          let existingFile = await state.db.getOne("Ftp", { url: body.url });
          if (existingFile) return { failure: "choose another url" };
        }
        await state.db.modifyOne("Ftp", { uuid: body.uuid }, (file) => {
          file.url = body.url;
          file.name = body.name;
          file.visibility = body.visibility;
          file.type = body.type;
          file.description = body.description;
        });
      },
      require: {
        ftp: {
          upload: true,
        }
      }
    },
    {
      path: "/upload",
      type: RequestType.POST,
      route: async (state: App, user: User, req: Request, res: Response) => {
        let file = await state.db.getOne("Ftp", { uuid: req.body.uuid });
        if (!file || !req.files || Array.isArray(req.files.file)) {
          res.send(400);
          return;
        }
        if (file.owner != user.uuid) {
          res.send(401);
          return;
        }
        req.files.file.mv("./ftp/" + req.body.uuid);
        res.send(200);
      },
      require: {
        ftp: {
          upload: true,
        },
      },
    },
  ],
};

function constructClientFile(file: Ftp.File): Ftp.ClientFile {
  return {
    name: file.name,
    uuid: file.uuid,
    url: file.url,
    type: file.type,
    description: file.description,
    visibility: file.visibility,
  };
}
