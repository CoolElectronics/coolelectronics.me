import express, { Application, IRoute, Request, Response } from "express";
import { API, Error, RequestType } from "./clienttypes";

import indexRoute, { socketConnect } from "./routes/index/index";
import signRoute from "./routes/sign/sign";
import homeRoute from "./routes/home/home";
import chatRoute from "./routes/chat/chat";
import accountRoute from "./routes/account/account";
import adminRoute from "./routes/admin/admin";
import gamesRoute from "./routes/games/games";
import ftpRoute from "./routes/ftp/ftp";
import playgroundRoute from "./routes/playground/playground";
import sparkboardRoute from "./routes/sparkboard/sparkboard";
import scheduleRoute from "./routes/schedule/schedule";

import * as Bridge from "./bridge/bot";

import { connect, Database, User } from "./db";

import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";

import * as Cookie from "cookie";
import * as path from "path";

import { Server, Socket } from "socket.io";

import http from "http";
import fileUpload from "express-fileupload";
import webpush from "web-push";

const port = 8080;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
export const parse = (cookie) => (cookie ? Cookie.parse(cookie) : null);

app.set("trust proxy", "loopback");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5000000000 },
  })
);
try {
  webpush.setVapidDetails(
    "mailto:kveonl98@gmail.com",
    process.env.PUSH_PUB!,
    process.env.PUSH_PRIV!
  );
} catch {}

global.rootDir = path.resolve(__dirname);

(async () => {
  let state: App = {
    db: await connect(),
    io,
    usercache: new AppCache<string, Socket | null, CachedUser>(),
  };
  let allusers = await state.db.getAll<User>("Users");
  for (let user of allusers) {
    state.usercache.addItem(user.uuid, null, {
      username: user.username,
      online: false,
      setOfflineTimer: null,
    });
  }

  let routes: Route[] = [
    indexRoute,
    signRoute,
    homeRoute,
    chatRoute,
    accountRoute,
    adminRoute,
    gamesRoute,
    ftpRoute,
    playgroundRoute,
    sparkboardRoute,
    scheduleRoute,
  ];

  app.use(["/assets"], express.static(__dirname + "/dist/assets"));
  app.use(["/pfp"], express.static(__dirname + "/pfp"));
  app.use(express.static(__dirname + "/static"));

  app.get("/bio", async (req: Request, res: Response) => {
    let misc = (await state.db.getOne("Misc", {})) as any;
    if (misc.visitedips.includes(req.ip)) {
      res.send(
        "hey! you've already been here. if you were here to see what the current count is, its " +
          misc.biocounter
      );
    } else {
      res.send(
        "thanks for helping me answer my question. if you were wondering, the answer is " +
          misc.biocounter
      );
      state.db.modifyOne("Misc", {}, (m) => {
        m.visitedips.push(req.ip);
        m.biocounter += 1;
      });
    }
  });

  routes.forEach((route) => {
    console.log(Object.keys(route));
    app.get("/" + route.path, (req: Request, res, next) => {
    console.log(req.headers["user-agent"]);
      if (
        (req.headers["user-agent"]?.toLowerCase().includes("bot") ||
        req.headers["user-agent"]?.toLowerCase().includes("curl")) && route.seopage
      ) {
        res.send(route.seopage);
      } else {
        if (route.require) {
          state.db.Validate(
            req.cookies,
            route.require,
            (user) => route.route(state, user, req, res, next),
            () => res.redirect("/sign"),
            () => res.sendFile(__dirname + "/dist/src/forbidden/forbidden.html")
          );
        } else {
          route.route(state, req, res, next);
        }
      }
    });
    route.api.forEach((endpoint) => {
      let path =
        "/api" +
        "/" +
        route.path +
        (endpoint.api ? endpoint.api.path : endpoint.path);
      console.log(path);
      let routefn = async function (req, res, next) {
        if (endpoint.require) {
          state.db.Validate(
            req.cookies,
            endpoint.require,
            async (user) => {
              if (endpoint.api) {
                let body: object | null = parseBody(
                  req.body,
                  endpoint.api.request
                );
                if (body) {
                  res.send(
                    await endpoint.route(state, user, body, req, res, next)
                  );
                } else {
                  res.send({ error: "invalid schema" });
                  console.log(
                    "bad schema. wanted " +
                      endpoint.api.request +
                      " got " +
                      req.body
                  );
                }
              } else {
                endpoint.route(state, user, req, res, next);
              }
            },
            () => res.send(401)
          );
        } else {
          endpoint.route(state, req, res, next);
        }
      };
      let type = endpoint.api ? endpoint.api.type : endpoint.type;
      switch (type) {
        case RequestType.GET:
          app.get(path, routefn);
          break;
        case RequestType.POST:
          app.post(path, routefn);
      }
    });
  });

  io.on("connection", (socket) => {
    socketConnect(state, socket);

    routes.forEach((route) => {
      route.listeners.forEach((listener) => {
        socket.on(route.path + ":" + listener.path, (arg) => {
          state.db.Validate(
            parse(socket.request.headers.cookie),
            listener.require,
            (user) => {
              listener.route(state, user, arg, socket);
            }
          );
        });
      });
    });
  });

  app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/dist/src/404/404.html");
  });
  httpServer.listen(port, () =>
    console.log(`Example app is listening on port ${port}.`)
  );
  Bridge.start(state,process.env.BOT_SECRET!,process.env.BOT_ID!);
})();

function parseBody(body: object, schema: object): object | null {
  let parsedbody = {};
  for (let k of Object.keys(schema)) {
    let v = schema[k];
    if (typeof body[k] == typeof v) {
      parsedbody[k] = body[k];
    } else {
      return null;
    }
  }
  return parsedbody;
}

interface Route {
  path: string;
  route: any;
  listeners: SocketEndpoint[];
  api: ApiEndpoint[];
  require?: object | null;
  seopage?: string;
}

export interface SocketEndpoint {
  path: string;
  route: Function;
  require: object;
}
export interface ApiEndpoint {
  path?: string;
  type?: RequestType;
  route: any;
  require?: object | null;
  api?: API;
}
export interface App {
  db: Database;
  io: Server;
  usercache: AppCache<string, Socket | null, CachedUser>;
}
export interface CachedUser {
  online: boolean;
  username: string;
  setOfflineTimer: ReturnType<typeof setTimeout> | null;
}
// not sure why this isn't a thing in base js, but whatever it works
class AppCache<K, V, C> {
  counter = 0;
  umap = {};
  keymap: any = {};
  valmap: any = {};
  addItem(key: K, val: V, data: C) {
    this.umap[this.counter] = {
      key,
      val,
      data,
    };
    this.keymap[key] = this.counter;
    this.valmap[val] = this.counter;
    this.counter += 1;
  }
  setVal(key: K, val: V, data: C | null = null) {
    let id = this.keymap[key];
    if (id) {
      this.umap[id].val = val;
      if (data) {
        this.umap[id].data = data;
      }
    } else if (data) {
      this.addItem(key, val, data);
    } else {
      throw "could not find key in cache";
    }
  }
  setKey(val: V, key: K, data: C | null = null) {
    let id = this.valmap[val];
    if (id) {
      this.umap[id].key = key;
      if (data) {
        this.umap[id].data = data;
      }
    } else if (data) {
      this.addItem(key, val, data);
    } else {
      throw "could not find key in cache";
    }
  }
  getVal(key: K): [V, C] | null {
    let id = this.keymap[key];
    return id ? [this.umap[id].val, this.umap[id].data] : null;
  }
  getKey(val: V): [K, C] | null {
    let id = this.valmap[val];
    return id ? [this.umap[id].key, this.umap[id].data] : null;
  }
  deleteKey(key: K) {
    this.del(this.keymap[key]);
  }
  deleteVal(val: V) {
    this.del(this.valmap[val]);
  }

  cache(id: number, data: C) {
    this.umap[id].data = data;
  }
  del(id: number) {
    let o = this.umap[id];
    delete this.keymap[o.key];
    delete this.valmap[o.val];
    delete this.umap[id];
  }
}
export function error(err: string): Error {
  return { error: err, trace: new Error().stack! };
}
