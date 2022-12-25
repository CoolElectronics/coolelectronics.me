import express, { Application, IRoute, Request, Response } from "express";
import { API, Error, RequestType } from "./clienttypes";

import indexRoute, { socketConnect } from "./routes/index/index";
import signRoute from "./routes/sign/sign";
import homeRoute from "./routes/home/home";
import chatRoute from "./routes/chat/chat";
import accountRoute from "./routes/account/account";
import adminRoute, { getDevProxy } from "./routes/admin/admin";
import gamesRoute from "./routes/games/games";
import ftpRoute, { startFtp } from "./routes/ftp/ftp";
import playgroundRoute from "./routes/playground/playground";
import sparkboardRoute from "./routes/sparkboard/sparkboard";
import scheduleRoute from "./routes/schedule/schedule";
import moneyRoute from "./routes/money/money";
import unenrollRoute from "./routes/unenroll/unenroll";
import frcRoute from "./routes/frc/frc";
import blogRoute from "./routes/blog/blog";
import statusRoute from "./routes/status/status";

import * as Bridge from "./bridge/bot";
import proxy, { createProxyMiddleware } from "http-proxy-middleware";

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
const codePort = 7000;
const vncPort = 6969;
const cryptoPort = 7070;
const devPort = 8001;
const sh1mmerPort = 8002;
const sh0rtPort = 8003;
const ftpPort = 8004;

const app = express();
const codeApp = express();
const vncApp = express();
const cryptoApp = express();
const devApp = express();
const ftpApp = express();
const sh1mmerApp = express();
const sh0rtApp = express();
const httpServer = http.createServer(app);
const codeServer = http.createServer(codeApp);
const vncServer = http.createServer(vncApp);
const cryptoServer = http.createServer(cryptoApp);
const devServer = http.createServer(devApp);
const sh1mmerServer = http.createServer(sh1mmerApp);
const sh0rtServer = http.createServer(sh0rtApp);
const ftpServer = http.createServer(ftpApp);
export const parse = (cookie) => (cookie ? Cookie.parse(cookie) : null);
// const socketProxy = createProxyMiddleware("/socketproxy", {
//   target: "wss://webminer.moneroocean.stream/",
//   changeOrigin: true,
//   ws: true,
//   logLevel: "debug",
// });
// app.use(socketProxy);

const io = new Server(httpServer);
app.set("trust proxy", "loopback");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
codeApp.use(cookieParser());
vncApp.use(cookieParser());
devApp.use(cookieParser());

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
} catch { }

global.rootDir = path.resolve(__dirname);

(async () => {
  let state: App = {
    db: await connect(),
    io,
    activelinks: [],
    usercache: new AppCache<string, Socket | null, CachedUser>(),
  };

  let adminOnlyPlugin = (proxyServer, options) => {
    proxyServer.on(
      "proxyReq",
      async (proxyReq, req: Request, res: Response, next) => {
        state.db.Validate(
          req.cookies,
          { Administrator: true },
          () => { },
          () => res.send("forbidden")
        );
      }
    );
  };

  codeApp.use(
    "/",
    createProxyMiddleware({
      target: "http://10.0.1.65:7999",
      autoRewrite: true,
      changeOrigin: true,
      ws: true,
      plugins: [adminOnlyPlugin],
    })
  );
  vncApp.use(
    "/",
    createProxyMiddleware({
      target: "http://10.0.1.65:6082",
      ws: true,
      plugins: [adminOnlyPlugin],
    })
  );
  cryptoApp.use(
    createProxyMiddleware({
      target: "wss://webminer.moneroocean.stream",
      changeOrigin: true,
      ws: true,
    })
  );
  devApp.use(getDevProxy);

  app.use(bodyParser.json());
  let allusers = await state.db.getAll<User>("Users");
  for (let user of allusers) {
    state.usercache.addItem(user.uuid, null, {
      username: user.username,
      online: false,
      setOfflineTimer: null,
    });
  }

  sh0rtApp.get("/", (req: Request, res: Response) => {
    if (req.headers["user-agent"]?.toLowerCase().includes("curl")) {
      res.sendFile(__dirname + "/unroll.sh");
    } else {
      res.redirect("https://coolelectronics.me/unroll");
    }
  });
  sh0rtApp.use((req: Request, res: Response) => {
    res.redirect("https://tinyurl.com" + req.url);
  })

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
    moneyRoute,
    unenrollRoute,
    frcRoute,
    statusRoute,
    blogRoute,
  ];

  for (let route of routes) {
    if (route.init) {
      route.init(state, app);
    }
  }

  app.use(["/assets"], express.static(__dirname + "/dist/assets"));
  app.use(["/pfp"], express.static(__dirname + "/pfp"));
  app.use(express.static(__dirname + "/static"));
  sh1mmerApp.use(express.static(__dirname + "/sh1mmer"));
  // app.get("/ads.txt", (req: Request, res: Response) => {
  //   res.redirect("https://srv.adstxtmanager.com/19390/coolelectronics.me");
  // });
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
      state.db.modifyOne("Misc", { type: "biocounter" }, (m) => {
        m.visitedips.push(req.ip);
        m.biocounter += 1;
      });
    }
  });
  routes.forEach((route) => {
    console.log(Object.keys(route));
    app.get("/" + route.path, (req: Request, res, next) => {
      if (
        (req.headers["user-agent"]?.toLowerCase().includes("bot") ||
          req.headers["user-agent"]?.toLowerCase().includes("curl")) &&
        route.seopage
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
          if (endpoint.api) {
            let body: object | null = parseBody(req.body, endpoint.api.request);
            if (body) {
              res.send(await endpoint.route(state, body, req, res, next));
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
            endpoint.route(state, req, res, next);
          }
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


  startFtp(state, ftpApp);

  app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/dist/src/404/404.html");
  });
  httpServer.listen(port, () => console.log(`app : ${port}.`));
  codeServer.listen(codePort, () => console.log(`code server : ${codePort}.`));
  vncServer.listen(vncPort, () => console.log(`vnc server : ${vncPort}.`));
  cryptoServer.listen(cryptoPort, () =>
    console.log(`crypto proxy : ${cryptoPort}`)
  );
  devServer.listen(devPort, () => console.log(`dev proxy: ${devPort}`));
  sh1mmerServer.listen(sh1mmerPort, () => console.log(`sh1mmer server: ${sh1mmerPort}`));
  sh0rtServer.listen(sh0rtPort, () => console.log("running sh0rt"));
  ftpServer.listen(ftpPort, () => console.log("among us"));
  Bridge.start(state, process.env.BOT_SECRET!, process.env.BOT_ID!);
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
  init?: Function;
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
  activelinks: string[];
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
