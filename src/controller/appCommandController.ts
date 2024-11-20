import { Request, Response } from "express";
import Scoreboards from "../models/scoreboard";
import { Interaction } from "../utils/parseInteraction";
import { formatLeaderboard, Leaderboard, LeaderboardOptions } from "../utils/leaderboardFormatter";
import { InteractionResponseType } from "discord-interactions";
import { ScoreboardNotFoundError } from "../utils/error";

export function NewScoreboard(req : Request, res : Response) {
    const body : Interaction = req.body;

    Scoreboards.create({
        guild: body.guild,
        author: body.user.id,
        name: body.options.name,
        players: []  
    }).then(scoreboard => {
        res.send({
            type: 4,
            data: {
                content: `Scoreboard ${scoreboard.name} has been created`,
                components: [
                    {
                        "type" : 1,
                        components : [
                            {
                                type: 2,
                                custom_id: `join:${scoreboard.id}`,
                                label: "join",
                                style: 1
                            }
                        ]
                    }
                    
                ]
            }
        })
    }).catch(error => {
        console.error('something went wrong');
        res.status(500).end();
    })
}

export function JoinScoreboard(req : Request, res : Response) {

    //@ts-ignore
    Scoreboards.addUserToScoreboard( req.body.user, req.body.options.scoreboard_id)
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

export function startScoreboard(req : Request, res : Response) {    
    Scoreboards.findById(req.body.options.scoreboard_id)
    .orFail(() => {
        throw ScoreboardNotFoundError;
    })
    .then(scoreboard => {

        //game cannot start if it has already started
        if (scoreboard.state != 'lobby') {
            const error = new Error('Scoreboard has already started.');
            throw error;
        }

        //only the user who created the scoreboard can start it.
        if (scoreboard.author != req.body.user.id) {
            const error = new Error('Only the creator of the scorebaord can start the game.');
            throw error;
        }

        scoreboard.state = 'active';

        scoreboard.save()
        .then(() => {
            res.send({
                type: 4,
                data: {
                    content: "Scoreboard has started."      
                }
            })
        })
    })
    .catch(err => {
        res.send({
            type: 4,
            data: {
                content: err.message,
                flags: 64
            }
        }).end();
    });
}

export function addPointScoreboard(req : Request, res : Response) {
    const { scoreboard_id, user_id, value = 1 } = req.body.options;

    //@ts-ignore
    Scoreboards.updateScore(scoreboard_id, user_id, value)
    .then((result : any) => {
        res.send({
            type: 4,
            data: {
                content: `${result.caller.name} now has ${result.caller.score} points!`,
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
    })
}

export function interfaceScoreboard(req : Request, res : Response) {
    const { scoreboard_id } = req.body.options;

    //@ts-ignore
    Scoreboards.getPlayerPositions(scoreboard_id, 10, req.body.user.id)
    .then((players : any) => {
        const options : LeaderboardOptions = {
            visibleOnlyToCaller: false,
            specialHighlighting: []
        }

        const message = formatLeaderboard(players as unknown as Leaderboard, options);

        res.send({
            type: 4,
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
                                "custom_id": `inc:${scoreboard_id}`
                            },
                            {
                                "type": 2,
                                "label": "-1",
                                "style": 4,
                                "custom_id": `dec:${scoreboard_id}`
                            }
                        ]
                    }
                ]
            }
        });
    })
}

export function peekScoreboard(req : Request, res : Response) {
    const { scoreboard_id } = req.body.options;

    //@ts-ignore
    Scoreboards.getPlayerPositions(scoreboard_id, 5, req.body.user.id)
    .then((players : any) => {
        const options : LeaderboardOptions = {
            visibleOnlyToCaller: true,
            specialHighlighting: [
                {
                    playerId: req.body.user.id,
                    highlight: '\u001b[0;32m'
                }
            ]
        }

        const message = formatLeaderboard(players as unknown as Leaderboard, options);

        res.send({
            type: 4,
            data: {
                content: message,
                flags: 64
            }
        })
    })
}

export function deleteScoreboard(req : Request, res : Response) {
    const { scoreboard_id } = req.body.options;

    Scoreboards.findById(scoreboard_id)
    .orFail(() => {
        throw ScoreboardNotFoundError;
    })
    .then((scoreboard) => {
        res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Are you sure you want to delete ${scoreboard.name}?`,
                "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "label": "Yes",
                                "style": 4,
                                "custom_id": `delete:${scoreboard_id}`
                            },
                            {
                                "type": 2,
                                "label": "Nevermind",
                                "style": 2,
                                "custom_id": `cancel:${scoreboard_id}`
                            }
                        ]
                    }
                ],
                flags: 64
            }
            
        });
    })
    .catch((err) => {
        res.send({
            type: 4,
            data: {
                content: err.message,
                flags: 64
            }
        })
    })

    
}
