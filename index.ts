
import express from "express";
import { Socket } from "socket.io";
import {App } from "./main";

export function socketConnect(state:App,socket:Socket){
   
}


export default {
  path: "/",
  route: (state,req,res)=>{
    res.sendFile(__dirname + "/dist/src/index.html")    
  },
  listeners:[],
  api:[]
};
