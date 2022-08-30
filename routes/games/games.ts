import { User } from "../../db";
import express, { Request, Response } from "express";
import { Socket } from "socket.io";
import { App, error, parse } from "../../main";
import {
  ClientGame,
  ClientGameCollection,
  RequestType,
  Error,
} from "../../clienttypes";
import { randomUUID } from "crypto";
import xss from "xss";
import * as Games from "./types";
import { trace } from "console";

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
      route: async (state: App, req: Request, res: Response) => {
        let collections = await state.db.getAll("Games");
        res.send(collections);
      },
    },
    {
      api: Games.NewCollection,
      route: async (
        state: App,
        user: User,
        body: Games.NewCollectionRequest
      ): Promise<Games.NewCollectionResponse | Error> => {
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

        return error("bad name");
      },
      require: {
        games: {
          add: true,
        },
      },
    },
    {
      api: Games.DeleteGame,
      route: async (
        state: App,
        user: User,
        body: Games.DeleteGameRequest
      ): Promise<Games.DeleteGameResponse | Error> => {
        let collection = await state.db.getOne("Games", {
          uuid: body.collection,
        });
        if (collection) {
          state.db.modifyOneProp(
            "Games",
            { uuid: body.collection },
            "games",
            (games) => games.filter((g) => g.uuid != body.uuid)
          );
          return null;
        } else {
          return error("could not find collection");
        }
      },
      require: {
        games: {
          remove: true,
        },
      },
    },
    {
      api: Games.EditCollection,
      route: async (
        state: App,
        user: User,
        body: Games.EditCollectionRequest
      ): Promise<Games.EditCollectionResponse | Error> => {
        let collection = await state.db.getOne("Games", { uuid: body.uuid });
        if (collection) {
          let sanitizedname = xss(body.name).normalize();
          let sanitizeddescription = xss(body.description).normalize();
          if (sanitizedname != "") {
            state.db.modifyOne("Games", { uuid: body.uuid }, (col) => {
              col.name = sanitizedname;
              col.description = sanitizeddescription;
            });
            return null;
          } else {
            return error("bad name");
          }
        } else {
          return error("collection does not exist");
        }
      },
      require: {
        games: {
          remove: true,
        },
      },
    },
    {
      api: Games.AddGame,
      route: async (
        state: App,
        user: User,
        body: Games.AddGameRequest
      ): Promise<Games.AddGameResponse | Error> => {
        let collection = await state.db.getOne("Games", {
          uuid: body.collection,
        });
        if (collection) {
          let sanitizedname = xss(body.name).normalize();
          let sanitizeddescription = xss(body.description).normalize();
          let sanitizedcredits = xss(body.credits).normalize();
          if (sanitizedname != "") {
            let game: ClientGame = {
              uuid: randomUUID(),
              name: sanitizedname,
              description: sanitizeddescription,
              addedby: user.uuid,
              rating: 0,
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
          return error("bad name");
        } else {
          return error("collection not found");
        }
      },
      require: {
        games: {
          add: true,
        },
      },
    },
    {
      api: Games.EditGame,
      route: async (
        state: App,
        user: User,
        body: Games.EditGameRequest
      ): Promise<Games.EditGameResponse | Error> => {
        let collection = await state.db.getOne("Games", {
          uuid: body.collection,
        });
        if (collection) {
          let sanitizedname = xss(body.name).normalize();
          let sanitizeddescription = xss(body.description).normalize();
          let sanitizedcredits = xss(body.credits);
          if (sanitizedname != "") {
            await state.db.modifyOne(
              "Games",
              { uuid: body.collection },
              (games) => {
                let game: ClientGame = games.games.find(
                  (g) => g.uuid == body.uuid
                );
                game.description = sanitizeddescription;
                game.name = sanitizedname;
                game.credits = sanitizedcredits;
                game.link = body.link;
              }
            );
            return null;
          }
          return error("bad name");
        } else {
          return error("collection not found");
        }
      },
      require: {
        games: {
          add: true,
        },
      },
    },
    {
      api: Games.CollectionRemove,
      route: async (
        state: App,
        user: User,
        body: Games.CollectionRemoveRequest
      ) => {
        let collection = await state.db.getOne("Games", {
          uuid: body.collection,
        });
        if (collection) {
          await state.db.database
            .collection("Games")
            .deleteOne({ uuid: body.collection });
          return;
        } else {
          return error("collection not found");
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
