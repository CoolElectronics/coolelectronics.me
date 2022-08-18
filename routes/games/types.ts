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

export interface CollectionAddRequest {
  title: string;
  description: string;
  credits: string;
  collection: string;
  rating: number;
  link: string;
}
export type CollectionAddResponse = ClientGame;
export const CollectionAdd = {
  type: RequestType.POST,
  path: "/collectionadd",
  route: "games",
  request: {
    title: "",
    description: "",
    credits: "",
    collection: "",
    rating: 1,
    link: "",
  },
};

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
