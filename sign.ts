import express from "express";
import * as bcrypt from "bcrypt";
import { RequestType,App } from "./main";
export default {
  path: "/sign",
  route: (state:App,req, res) => {
    res.sendFile(__dirname + "/dist/src/sign/sign.html");
  },
  listeners: [],
  api: [
    {
      path: "up",
      type: RequestType.POST,
      route: (state:App, req, res) => {},
    },
    {
      path: "in",
      type: RequestType.POST,
      route: async (state:App, req, res) => {
        console.log(req.body);
        let username = req.body.username;
        let user = await state.database.getUser(username);
        if (user){
          let matches = await bcrypt.compare(req.body.password,user.hash);
          if (matches){
            res.send({
              success:true,
            })
          }else{
            res.send({
              success:false,
              reason: "incorrect password",
            })
          }
        }else{
          res.send({
            success:false,
            reason: "user does not exist"
          })
        }
      },
    },
  ],
};
