import {
  ClientGame,
  ClientGameCollection,
  RequestType,
} from "../../clienttypes";

export interface NewCollectionRequest {
  name: string;
  description: string;
}
export type NewCollectionResponse = ClientGameCollection;
export const NewCollection = {
  type: RequestType.POST,
  path: "/newcollection",
  route: "games",
  request: {
    name: "",
    description: "",
  },
};
export interface EditCollectionRequest {
  name: string;
  description: string;
  uuid:string;
}
export type EditCollectionResponse = null;
export const EditCollection = {
  type: RequestType.POST,
  path: "/editcollection",
  route: "games",
  request: {
    name: "",
    description: "",
    uuid:"",
  },
};

export interface AddGameRequest {
  name: string;
  description: string;
  credits: string;
  collection: string;
  link: string;
}
export type AddGameResponse = ClientGame;
export const AddGame = {
  type: RequestType.POST,
  path: "/gameadd",
  route: "games",
  request: {
    name: "",
    description: "",
    credits: "",
    collection: "",
    link: "",
  },
};

export interface DeleteGameRequest {
  collection:string;
  uuid:string;
}
export type DeleteGameResponse = null;
export const DeleteGame = {
  type:RequestType.POST,
  path: "/gamedelete",
  route: "games",
  request: {
    collection: "",
    uuid:"",
  }
}

export interface EditGameRequest{
  name:string;
  description:string;
  credits: string;
  link:string;

  collection:string;
  uuid:string;
}
export type EditGameResponse = null;
export const EditGame = {
  type: RequestType.POST,
  path: "/editgame",
  route: "games",
  request: {
    name: "",
    description: "",
    credits: "",
    collection: "",
    link: "",
    uuid:""
  },

}

export interface CollectionRemoveRequest {
  collection: string;
}
export type CollectionRemoveResponse = void;
export const CollectionRemove = {
  type: RequestType.POST,
  path: "/collectionremove",
  route: "games",
  request: {
    collection: "",
  },
};
