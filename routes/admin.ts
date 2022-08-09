
import { App } from "../main";
import { User } from "../db";
import { Request, Response } from "express";

export default {
  path: "/admin",
  route: (state:App,user:User,req:Request,res:Response) => {
    res.sendFile(global.appRoot + "/dist/src/admin/admin.html"); 
  },
  require: {
    Administrator:true,
  },
  api:[],
  listeners:[], 
}
