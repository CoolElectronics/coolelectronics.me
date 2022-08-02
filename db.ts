import { MongoClient, ObjectId, Db } from "mongodb";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const client = new MongoClient(process.env.MONGO_URI!);

export async function connect(): Promise<Database> {
  let db = await client.connect();
  return new Database(db.db("database"));
}
export class Database {
  database: Db;
  constructor(database: Db) {
    this.database = database;
  }
  async appendToList(collection:string,selector:object,propname:any,toappend:any){
    try{
      let obj = await this.database.collection(collection).findOne(selector);
      if (obj){
        let array = obj[propname];
        array.push(toappend);
        let setter = {
          $set:{}
        }
        setter.$set[propname] = array;
        this.database.collection(collection).updateOne(selector,setter);
      }
    }catch (err){
      console.error(err);
    }
  }


  async getUser(username: string): Promise<User | null> {
    try {
      let user = await this.database.collection("Users").findOne<User>({
        username,
      });

      // schema traps here

      return user;
    } catch (err) {
      console.error(err);
    }
    return null;
  }
  async addUser(username: string, hash: string) {
    await this.database.collection("Users").insertOne(constructUser(username,hash));
  }

  async Validate(
    cookies,
    permissions: any,
    success: Function,
    failiure: Function,
    denied: Function = failiure
  ) {
    var payload: UserPayload;
    if (cookies != null) {
      if (cookies.token != null) {
        try {
          payload = jwt.verify(cookies.token, process.env.JWT!, {
            algorithms: ["HS256"],
          }) as UserPayload;
        } catch (e) {
          return failiure();
        }
        if (payload.username != null) {
          let data = await this.getUser(payload.username)!;
          if (parsePermissions(data!.permissions, permissions)) {
            return success(data);
          } else {
            return denied(data);
          }
        } else {
          return failiure();
        }
      } else {
        return failiure();
      }
    } else {
      return failiure();
    }
  }
}
function parsePermissions(present: any, required: any) {
  if (present?.Administrator) {
    return true;
  }
  let allowed = true;
  Object.entries(required).every((kvp) => {
    /// wow thanks javascript lets have 2 methods that do exactly the same thing except one does exactly the opposite of what you think it should do
    let pre = present[kvp[0]];
    let req = required[kvp[0]];
    switch (typeof pre) {
      case "bigint":
      case "number":
        if (pre < req) {
          allowed = false;
          break;
        }
        return;
      case "boolean":
      case "string":
        if (pre != req) {
          allowed = false;
          return;
        }
        break;
      case "object":
        if (!parsePermissions(pre, req)) {
          allowed = false;
          return;
        }
        break;
      default:
        allowed = false;
        return;
    }
  });
  return allowed;
}

export interface User {
  username: string;
  hash: string;
  friends: ObjectId[];
  worker: any; // later
  permissions: object;
  notifications: Notification[];
  files: ObjectId[];
  boards: ObjectId[];
}
function constructUser(username: string, hash: string) {
  return {
    username,
    hash,
    friends: [],
    worker: null,
    permissions: {},
    notifications: [],
    files: [],
    boards:[],
  };
}
export interface Notification {}
export interface UserPayload {
  username: string;
}
