import { constructClientUser, User } from "../../db";
import { Request, Response } from "express";
import { App } from "../../main";
import * as Frc from "./types"
import { randomUUID } from "crypto";
export default {
    path: "frc",
    route: (state: App, user: User, req: Request, res: Response) => {
        res.sendFile(global.rootDir + "/dist/src/frc/frc.html");
    },
    require: {},
    listeners: [],
    api: [
        {
            api: Frc.AddRobot,
            route: async (state: App, user: User, body: Frc.AddRobotRequest): Promise<null | Error> => {
                let robot: Frc.Robot = body;
                robot.scout = user.uuid;
                robot.uuid = randomUUID();
                await state.db.addOne("FrcData", robot);
                return null;
            },
            require: {}
        },
        {
            api: Frc.GetRobots,
            route: async (state: App, user: User): Promise<Frc.GetRobotsResponse> => {
                let responses: Frc.GetRobotsResponse = [];

                let robots = await state.db.getAll<Frc.Robot>("FrcData");

                for (let robot of robots) {
                    let response = {
                        robot,
                        scout: await constructClientUser(state, robot.scout!),
                    }
                    responses.push(response);
                }

                return responses;
            },
            require: {}
        },
        {
            api: Frc.DeleteRobot,
            route: (state: App, user: User, body: Frc.DeleteRobotRequest) => {
                state.db.database.collection("FrcData").deleteOne({
                    uuid: body.uuid,
                });
            },
            require: {},
        }
    ]
}
