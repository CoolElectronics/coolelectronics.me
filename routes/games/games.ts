import { User } from "../../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, parse } from "../../main";
import {
  ClientGame,
  ClientGameCollection,
  RequestType,
  Error,
} from "../../clienttypes";
import { randomUUID } from "crypto";
import xss from "xss";
import {
  CollectionAdd,
  CollectionAddRequest,
  CollectionAddResponse,
  CollectionRemove,
  CollectionRemoveRequest,
  NewCollection,
  NewCollectionRequest,
  NewCollectionResponse,
} from "./types";

export default {
  path: "games",
  route: (state: App, req: Request, res: Response) => {
    res.sendFile(global.rootDir + "/dist/src/games/games.html");
  },
  listeners: [],
  api: [
    {
      path: "/collections",
      type: RequestType.GET,
      route: async (state: App, User, req: Request, res: Response) => {
        let collections = await state.db.getAll("Games");
        res.send(collections);
      },
    },
    {
      api: NewCollection,
      route: async (
        state: App,
        user: User,
        body: NewCollectionRequest
      ): Promise<NewCollectionResponse | Error> => {
        let sanitizedname = xss(body.name).normalize();
        let sanitizeddescription = xss(body.description).normalize();
        if (sanitizedname != "") {
          let col: ClientGameCollection = {
            creator: user.uuid,
            games: [],
            uuid: randomUUID(),
            name: sanitizedname,
            description: sanitizeddescription,
          };
          await state.db.addOne("Games", col);
          return col;
        } else {
          console.log(body);
        }

        return { error: "bad name" };
      },
      require: {
        games: {
          add: true,
        },
      },
    },
    {
      api: CollectionAdd,
      route: async (
        state: App,
        user: User,
        body: CollectionAddRequest
      ): Promise<CollectionAddResponse | Error> => {
        let collection = await state.db.getOne("Games", {
          uuid: body.collection,
        });
        if (collection) {
          let sanitizedname = xss(body.title).normalize();
          let sanitizeddescription = xss(body.description).normalize();
          let sanitizedcredits = xss(body.credits);
          if (sanitizedname != "") {
            let game: ClientGame = {
              uuid: randomUUID(),
              title: sanitizedname,
              description: sanitizeddescription,
              addedby: user.uuid,
              rating: body.rating,
              credits: sanitizedcredits,
              link: body.link,
            };
            await state.db.appendToList(
              "Games",
              { uuid: body.collection },
              "games",
              game
            );
            return game;
          }
          return { error: "bad name" };
        } else {
          return { error: "collection not found" };
        }
      },
      require: {
        games: {
          add: true,
        },
      },
    },
    {
      api: CollectionRemove,
      route: async (state: App, user: User, body: CollectionRemoveRequest) => {
        let collection = await state.db.getOne("Games", {
          uuid: body.collection,
        });
        if (collection) {
          await state.db.database
            .collection("Games")
            .deleteOne({ uuid: body.collection });
          return;
        } else {
          return { error: "collection not found" };
        }
      },
      require: {
        games: {
          remove: true,
        },
      },
    },
  ],
};
