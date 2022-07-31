import express, { Application, IRoute } from "express";

import indexRoute, { socketConnect }  from "./index";
import signRoute from "./sign";
import { connect,Database } from "./db";

import cors from 'cors';
import bodyParser from "body-parser";
import compression from 'compression';
import cookieParser from 'cookie-parser';

import * as Cookie from 'cookie';

import { Server } from 'socket.io';

import http from 'http';
import { listeners } from "process";
const port = 8080;


const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
const parse = cookie => cookie ? Cookie.parse(cookie) : null; 

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(compression());
app.use(express.json());
app.use(cookieParser());

(async () => {
  let state:App = {
    database: await connect()
  }

  let routes: Route[] = [indexRoute, signRoute];

  app.use(["/assets"], express.static(__dirname + "/dist/assets"));
  routes.forEach((route) => {
    app.get(route.path, (req,res,next)=> route.route(state,req,res,next));
    route.api.forEach(endpoint=>{
      let path = route.path + "/api/" + endpoint.path;
      let routefn = (req,res,next) => endpoint.route(state,req,res,next);
      switch (endpoint.type){
        case RequestType.GET:
          app.get(path,routefn)
          break;
        case RequestType.POST:
          app.post(path,routefn);
      }
    })
  });

  io.on("connection",socket =>{

    let cookies = parse(socket.request.headers.cookie);
    state.database.Validate(cookies,{},user=>{},()=>{},()=>{});
    
    routes.forEach(route=>{
      route.listeners.forEach(listener=>{
        socket.on(route.path + ":" + listener.path,(arg)=>listener.route(state,arg))
      })
    })
  })

  httpServer.listen(port, () => console.log(`Example app is listening on port ${port}.`));
})();

interface Route {
  path: string;
  route: any;
  listeners: SocketEndpoint[];
  api: ApiEndpoint[];
}

export interface SocketEndpoint{
  path: string,
  route: Function,
}
export interface ApiEndpoint {
  path: string;
  type: RequestType,
  route: any;
}
export interface App{
  database:Database,
}
export const enum RequestType{
  GET,
  POST,
  // really thats all i should need for now
}
