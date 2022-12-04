import { constructClientUser, User } from "../../db";
import { Request, Response } from "express";
import { App } from "../../main";
import * as Status from "./types"
import { randomUUID } from "crypto";
import axios from "axios";
import { State } from "pixi.js";
import { noop } from "svelte/internal";
// import 
export default {
    path: "status",
    route: (state: App, user: User, req: Request, res: Response) => {
        res.sendFile(global.rootDir + "/dist/src/status/status.html");
    },
    init: async (state: App) => {
        let users = await state.db.getAll<Status.StatusUser>("Stati");
        for (let user of users) {
            switchStatus(state, user.uuid);
        }
    },
    require: {},
    listeners: [],
    api: [
        {
            api: Status.GetStatusUser,
            route: async (state: App, user: User): Promise<Status.GetStatusUserResponse> => {
                let statususer = await state.db.getOne<Status.StatusUser>("Stati", { uuid: user.uuid });
                if (!statususer) {
                    statususer = {
                        uuid: user.uuid,
                        token: "",
                        delay: 60,
                        stati: [],
                    };
                    await state.db.addOne("Stati", statususer);
                }
                return statususer;
            },
            require: {},
        },
        {
            api: Status.SetSettings,
            route: async (state: App, user: User, body: Status.SetSettingsRequest): Promise<null> => {
                await state.db.modifyOne("Stati", { uuid: user.uuid }, s => {
                    s.token = body.token;
                    s.delay = body.delay;
                    s.stati = body.stati;
                });
                return null;
            },
            require: {}
        },
        {
            api: Status.Wtf,
            route: async (state: App, user: User): Promise<null> => {
                return null;
            },
            require: {}
        },
    ]
}
function rollStatus(user: Status.StatusUser): string {
    if (!user.unusedstati || user.unusedstati?.length == 0) {
        user.unusedstati = [...user.stati];
    }
    return user.unusedstati.splice(Math.floor(Math.random() * user.unusedstati.length), 1)[0];
}
async function switchStatus(state: App, uuid) {
    state.db.modifyOne("Stati", { uuid }, async (user) => {
        axios.patch("https://discord.com/api/v9/users/@me/settings", {
            custom_status: {
                text: rollStatus(user as Status.StatusUser),
            }
        }, {
            headers: {
                "authorization": user.token
            }
        }).catch(noop);
        setTimeout(() => {
            switchStatus(state, uuid)
        }, user.delay * 1000 + user.delay * 300 * Math.random());
    })
}