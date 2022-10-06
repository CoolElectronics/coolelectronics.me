import { MongoClient, Db, Document } from "mongodb";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { noop } from "svelte/internal";
import { randomUUID } from "crypto";
import { ClientUser, ClientUserSettings } from "./clienttypes";
import { App, CachedUser } from "./main";
import { Socket } from "socket.io";
import { PushSubscription } from "web-push";
import { File } from "./routes/ftp/ftp";

dotenv.config();
const client = new MongoClient(process.env.MONGO_URI!);

export async function connect(): Promise<Database> {
  let mongo = await client.connect();
  let database = new Database(mongo.db("database"));
  await database.declareCollections([
    "Users",
    "Rooms",
    "Games",
    "Ftp",
    "Boards",
    "FriendRequests",
    "Misc"
  ]);
  await database.updateUserSchemas();
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
  async updateUserSchemas(){
    let users = await this.getAll("Users");
    for (let user of users){
      updateUserSchema(user,this);
    }
  }
  async appendToList(
    collection: string,
    selector: object,
    propname: any,
    toappend: any
  ) {
    let modifier = (prop: any[]) => [...prop, toappend];
    await this.modifyOneProp(collection, selector, propname, modifier);
  }
  async removeFromList(
    collection: string,
    selector: object,
    propname: any,
    toremove: any
  ) {
    let modifier = (prop: any[], obj: any) =>
      prop.filter((prop) => prop != toremove);
    await this.modifyOneProp(collection, selector, propname, modifier);
  }
  async modifyOneProp(
    collection: string,
    selector: object,
    propname: string,
    modifier: (prop: any, obj: any) => Something
  ) {
    let obj = await this.database.collection(collection).findOne(selector);
    if (obj) {
      let set: Something = modifier(obj[propname], obj);
      let setter = {
        $set: {},
      };
      setter.$set[propname] = set;
      await this.database.collection(collection).updateOne(selector, setter);
    } else {
      console.trace("something was null in " + collection);
    }
  }
  async modifyOne(
    collection: string,
    selector: object,
    modifier: (obj: Document) => void
  ) {
    let obj = await this.database
      .collection(collection)
      .findOne<Document>(selector);
    if (obj) {
      modifier(obj);
      await this.database.collection(collection).replaceOne(selector, obj);
    } else {
      throw (
        "could not update " +
        collection +
        " because the selected object does not exist"
      );
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
  async addOne<T = Document>(collection: string, obj: T) {
    await this.database.collection(collection).insertOne(obj);
  }

  async getUser(id: string): Promise<User | null> {
    let user = await this.getOne<User>("Users", { uuid: id });

    return user;
  }

  async getUserByName(username: string): Promise<User | null> {
    let user = await this.getOne<User>("Users", { username });
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
  settings: ClientUserSettings;
  pushsubscription: PushSubscription | null;
  boards: string[];
  files: File[];
  discordId?:string;
  version: number;
}
export interface Room {
  uuid: string;
  name: string;
  owner: string;
  users: string[];
  messages: ChatMessage[];
  public: boolean;
  channel?:string;
}
export interface ChatMessage {
  uuid: string;
  sender: string;
  message: string;
  timestamp: Date;
  //reply?
}
export interface FriendRequest {
  uuid: string;
  from: string;
  to: string;
}

function constructUser(username: string, hash: string): User {
  return {
    uuid: randomUUID(),
    username,
    hash,
    friends: [],
    worker: null,
    permissions: {},
    notifications: [],
    settings: {
      pushNotifs: true,
    },
    boards: [],
    files: [],
    version: 2,
    pushsubscription: null,
  };
}
export async function constructClientUser(
  state: App,
  uuid: string
): Promise<ClientUser> {
  let cached: [Socket | null, CachedUser] | null = state.usercache.getVal(uuid);
  if (cached) {
    return {
      name: cached[1].username,
      online: cached[1].online,
      uuid,
    };
  } else {
    let user = await state.db.getUser(uuid);
    if (user){
    return {
      name: user.username,
      online: false,
      uuid,
    };
  }else{
      console.error(uuid);
      return {
        name: "wtf",
        online:false,
        uuid,
      };
  }
  }
}
export interface UserPayload {
  userid: string;
}
type Something = Defined extends void ? never : Defined;
type Defined = any extends undefined ? never : any;
function updateUserSchema(olduser: any,db) {
  if (olduser.version == 2) return;
  olduser.version = 2;
  olduser.files = [];
  olduser.boards = [];
  db.database
        .collection("Users")
        .findOneAndReplace({ uuid: olduser.uuid},olduser);


}
