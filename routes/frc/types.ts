import { ClientUser, RequestType } from "../../clienttypes";

export interface Robot{

    team:number,
    match:number,
    taxi:boolean,

    note:string,
    auto:CargoScore,
    teleop:CargoScore,
    endgame: EndgameScore,

    scout?: string,
    uuid?: string,
}
export enum EndgameScore{
    NONE,
    LOW,
    MIDDLE,
    HIGH,
    TRAVERSAL
}
export interface CargoScore{
    lower:Score
    upper:Score,   
}
export interface Score{
    missed:number,
    scored:number,
}
export interface ClientRobot{
    scout: ClientUser,
    robot: Robot,
}

export type AddRobotRequest = Robot;
  export const AddRobot = {
    type: RequestType.POST,
    path: "addrobot",
    route: "frc",
    request:{
      team:0,
      match:0,
      taxi:false,
      note:"",
      auto:{},
      teleop:{},
      endgame:0,
    }
}

export type GetRobotsResponse = ClientRobot[];
export const GetRobots = {
    type: RequestType.GET,
    path: "robots",
    route: "frc",
    request: {},
};

export interface DeleteRobotRequest{
    uuid:string,
}
export const DeleteRobot = {
    type: RequestType.POST,
    path: "delete",
    route: "frc",
    request: {
        uuid:"",
    },
};