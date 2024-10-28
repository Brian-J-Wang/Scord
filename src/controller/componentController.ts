import Scoreboards from "../Models/scoreboard";
import { Request, Response } from "express";
import { formatLeaderboard, Leaderboard, LeaderboardOptions } from "../utils/leaderboardFormatter";

export function joinScoreboard(req : Request, res : Response) {
    //@ts-ignore
    Scoreboards.addUserToScoreboard( req.body.user, req.body.options.join)
    .then((scoreboard : any) => {
        res.send({
            type: 4,
            data: {
                content: `You've successfully joined ${scoreboard.name}`,
                flags: 64
            }
        })
    })
    .catch((err : Error) => {
        res.send({
            type: 4,
            data: {
                content: err.message,
                flags: 64
            }
        })
    });
}

export function increaseScore(req : Request, res : Response) {
    //@ts-ignore
    Scoreboards.updateScore(req.body.options.inc, req.body.user.id, 1)
    .then((scoreboard : any) => {
        const options : LeaderboardOptions = {
            visibleOnlyToCaller: false,
            specialHighlighting: [
                {
                    playerId: req.body.user.id,
                    highlight: "\u001b[0;32m"
                }
            ]
        }

        const message = formatLeaderboard(scoreboard as unknown as Leaderboard, options);

        res.send({
            type: 7,
            data: {
                content: message,
                "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "label": "+1",
                                "style": 3,
                                "custom_id": `inc:${req.body.options.inc}`
                            },
                            {
                                "type": 2,
                                "label": "-1",
                                "style": 4,
                                "custom_id": `dec:${req.body.options.inc}`
                            }
                        ]
                    }
                ]
            }
        });
    })
}

export function decreaseScore(req : Request, res : Response) {
//@ts-ignore
Scoreboards.updateScore(req.body.options.dec, req.body.user.id, -1)
.then((scoreboard : any) => {
    const options : LeaderboardOptions = {
        visibleOnlyToCaller: false,
        specialHighlighting: [
            {
                playerId: req.body.user.id,
                highlight: "\u001b[0;31m"
            }
        ]
    }

    const message = formatLeaderboard(scoreboard as unknown as Leaderboard, options);

    res.send({
        type: 7,
        data: {
            content: message,
            "components": [
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "+1",
                            "style": 3,
                            "custom_id": `inc:${req.body.options.dec}`
                        },
                        {
                            "type": 2,
                            "label": "-1",
                            "style": 4,
                            "custom_id": `dec:${req.body.options.dec}`
                        }
                    ]
                }
            ]
        }
    });
})
}

export function confirmDeleteScoreboard(req : Request, res : Response) {

    console.log(req.body);

    Scoreboards.findByIdAndDelete(req.body.options.delete)
    .orFail(() => {
        const error = new Error("Scoreboard not found");
        throw error;
    })
    .then((scoreboard) => {
        res.send({
            type: 7,
            data: {
                content: `${scoreboard.name} has been successfully deleted`,
                "components": []
            }
        })
    })
    .catch((err) => {
        res.send({
            type: 7,
            data: {
                content: err.message,
                "components": []
            }
        })
    })
}

export function cancelDeleteScoreboard(req: Request, res: Response) {
    res.send({
        type: 7,
        data: {
            content: "Deletion cancelled",
            flags: 64,
            "components": []
        }
    })
}