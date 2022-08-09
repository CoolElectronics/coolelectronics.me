import { MongoClient, Db, Document } from "mongodb";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { noop } from "svelte/internal";
import { randomUUID } from "crypto";

dotenv.config();
const client = new MongoClient(process.env.MONGO_URI!);

export async function connect(): Promise<Database> {
  let mongo = await client.connect();
  let database = new Database(mongo.db("database"));
  await database.declareCollections(["Users", "Rooms", "Games", "Ftp","FriendRequests"]);
  return database;
}
export class Database {
  database: Db;
  constructor(database: Db) {
    this.database = database;
  }
  async declareCollections(names: string[]) {
    names.forEach(async (name) => {
      if (
        !(await this.database.listCollections().toArray())
          .map((c) => c.name)
          .includes(name)
      ) {
        this.database.createCollection(name, (err, res) => {
          if (err) throw err;
        });
      }
    });
  }
  async appendToList(
    collection: string,
    selector: object,
    propname: any,
    toappend: any
  ) {
    try {
      let obj = await this.database.collection(collection).findOne(selector);
      if (obj) {
        let array = obj[propname];
        array.push(toappend);
        let setter = {
          $set: {},
        };
        setter.$set[propname] = array;
        this.database.collection(collection).updateOne(selector, setter);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async getAll<T = Document>(collection: string): Promise<T[]> {
    return await this.database.collection(collection).find<T>({}).toArray();
  }
  async getOne<T = Document>(
    collection: string,
    selector: object
  ): Promise<T | null> {
    return await this.database.collection(collection).findOne<T>(selector);
  }
  async addOne<T = Document>(collection:string,obj:T){
    await this.database.collection(collection).insertOne(obj);
  }

  async getUser(id:string): Promise<User | null> {
    let user = await this.getOne<User>("Users", { uuid: id });

    let updated = updateUserSchema(user);
    if (user != updated){
      user = updated;
      this.database.collection("Users").findOneAndReplace({uuid:id},updated);
    }

    return user;
  }

  async getUserByName(username:string): Promise<User | null> {
    let user = await this.getOne<User>("Users", { username});
    let updated = updateUserSchema(user);
    if (user != updated){
      user = updated;
      this.database.collection("Users").findOneAndReplace({username},updated);
    }
    return user;
  }
  async addUser(username: string, hash: string) {
    await this.database
      .collection("Users")
      .insertOne(constructUser(username, hash));
  }

  async Validate(
    cookies,
    permissions: any,
    success: Function,
    failiure: Function = noop,
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
        if (payload.userid != null) {
          let data = await this.getUser(payload.userid);
          if (data) {
            if (parsePermissions(data!.permissions, permissions)) {
              return success(data);
            } else {
              return denied(data);
            }
          }
        }
      }
    }
    return failiure();
  }
}
function parsePermissions(present: any, required: any) {
  if (present?.Administrator) {
    return true;
  }
  let allowed = true;
  Object.entries(required).every((kvp) => {
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
  uuid: string;
  username: string;
  hash: string;
  friends: string[];
  worker: any; // later
  permissions: object;
  notifications: Notification[];
  files: string[];
  boards: string[];
}
export interface Room {
  uuid: string;
  name: string;
  owner: string;
  users: string[];
  messages: ChatMessage[];
  public: boolean;
}
export interface ChatMessage {
  uuid: string;
  sender: string;
  message: string;
  timestamp: Date;
  //reply?
}
function constructUser(username: string, hash: string) {
  return {
    uuid:randomUUID(),
    username,
    hash,
    friends: [],
    worker: null,
    permissions: {},
    notifications: [],
    files: [],
    boards: [],
  };
}
export interface Notification {}
export interface UserPayload {
  userid: string;
}
function updateUserSchema(olduser:any): User{
  return olduser;
}
