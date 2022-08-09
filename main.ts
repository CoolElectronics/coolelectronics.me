import express, { Application, IRoute } from "express";

import indexRoute, { socketConnect } from "./routes/index";
import signRoute from "./routes/sign";
import homeRoute from "./routes/home";
import chatRoute from "./routes/chat";
import accountRoute from "./routes/account";
import { connect, Database, User } from "./db";

import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";

import * as Cookie from "cookie";
import * as path from "path";

import { Server, Socket } from "socket.io";

import http from "http";
import { listeners } from "process";
const port = 8080;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
export const parse = (cookie) => (cookie ? Cookie.parse(cookie) : null);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(express.json());
app.use(cookieParser());

global.rootDir = path.resolve(__dirname);

(async () => {
  let state: App = {
    db: await connect(),
    io,
    usercache: new AppCache<string,Socket|null,CachedUser>()
  };
  let allusers = await state.db.getAll<User>("Users");
  for (let user of allusers){
    state.usercache.addItem(user.uuid,null,{
      username:user.username,
      online:false
    })
  }
  
  let routes: Route[] = [indexRoute, signRoute, homeRoute, chatRoute, accountRoute];

  app.use(["/assets"], express.static(__dirname + "/dist/assets"));
  app.use (["/pfp"], express.static(__dirname + "/pfp"));
  routes.forEach((route) => {
    app.get("/"+route.path, (req, res, next) => {
      if (route.require) {
        state.db.Validate(
          req.cookies,
          route.require,
          (user) => route.route(state, user, req, res, next),
          () => res.redirect("/sign"),
          () => res.send("you don't have the permissions to be here")
        );
      } else {
        route.route(state, req, res, next);
      }
    });
    route.api.forEach((endpoint) => {
      let path = "/api" + "/" + route.path + endpoint.path;
      console.log(path);
      let routefn = function (req, res, next) {
        if (endpoint.require) {
          state.db.Validate(
            req.cookies,
            endpoint.require,
            (user) => endpoint.route(state, user, req, res, next),
            () => res.send(401)
          );
        } else {
          endpoint.route(state, req, res, next);
        }
      };
      switch (endpoint.type) {
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
            user => {
              listener.route(state,user,arg,socket);
            },
          );
        });
      });
    });
  });

  httpServer.listen(port, () =>
    console.log(`Example app is listening on port ${port}.`)
  );
})();

interface Route {
  path: string;
  route: any;
  listeners: SocketEndpoint[];
  api: ApiEndpoint[];
  require?: object | null;
}

export interface SocketEndpoint {
  path: string;
  route: Function;
  require: object;
}
export interface ApiEndpoint {
  path: string;
  type: RequestType;
  route: any;
  require?: object | null;
}
export interface App {
  db: Database;
  io: Server;
  usercache: AppCache<string,Socket|null,CachedUser>;
}
export interface CachedUser{
  online:boolean;
  username:string;
}
export const enum RequestType {
  GET,
  POST,
  // really thats all i should need for now
}
// not sure why this isn't a thing in base js, but whatever it works
class AppCache<K,V,C>{
  counter = 0;
  umap = {};
  keymap:any = {};
  valmap:any = {};
  addItem(key:K,val:V,data:C){
    this.umap[this.counter] = {
      key,
      val,
      data,
    }
    this.keymap[key] = this.counter;
    this.valmap[val] = this.counter;
    this.counter += 1;
  }
  setVal(key:K,val:V,data:C|null = null){
    let id = this.keymap[key];
    if (id){
      this.umap[id].val = val;
      if (data){
        this.umap[id].data = data;
      }
    }else if (data){
      this.addItem(key,val,data);
    }else{
      throw "could not find key in cache";
    }
  }
  setKey(val:V,key:K,data:C|null = null){
    let id = this.valmap[val];
    if (id){
    this.umap[id].key = key;
    if (data){
      this.umap[id].data = data;
    }
    }else if (data){
      this.addItem(key,val,data);
    }else{
      throw "could not find key in cache";
    }
  }
  getVal(key:K):[V,C] | null{
    let id = this.keymap[key];
    return [this.umap[id].val,this.umap[id].data];
  }
  getKey(val:V):[K,C] | null{
    let id = this.valmap[val];
    return [this.umap[id].key,this.umap[id].data];
  }
  deleteKey(key:K){
    this.del(this.keymap[key]);
  }
  deleteVal(val:V){
    this.del(this.valmap[val]);
  }

  cache(id:number,data:C){
    this.umap[id].data = data;
  }
  del(id:number){
    let o = this.umap[id];
    delete this.keymap[o.key];
    delete this.valmap[o.val];
    delete this.umap[id];
  }

}
