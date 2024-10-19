"use strict";
import Scoreboards, { getPlayerPositions, updateScore } from "../Models/scoreboard";
import { Request, Response } from "express";
import { Interaction } from "../utils/parseInteraction";
import { formatLeaderboard, Leaderboard, LeaderboardOptions } from "../utils/leaderboardFormatter";
const dotenv = require('dotenv');
dotenv.config();

export function newScoreboard(body: Interaction, res: Response) {
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

export function joinScoreboard(body: Interaction, res : Response) {
    function extractScoreboardId() {
        //interaction is a application command
        if (body.type == 2) {
            return body.options.id;
        //interaction type is a message component
        } else if (body.type == 3) {
            return body.options.join;
        }
    }

    const scoreboardId = extractScoreboardId();

    addUserToScoreboard(body.user, scoreboardId)
    .then((scoreboard : any) => {
        res.send({
            type: 4,
            data: {
                content: `You successfully joined ${scoreboard.name}.`,
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
        }).end();
    });
}

//joining the scoreboard through this method will not update the original message that sent the scoreboard...
//need user id, and the scoreboard id.
    //any issues will return a error code,
function addUserToScoreboard(user : { name: string, id: string }, scoreboardId : string ) : any {

    return Scoreboards.findById(scoreboardId)
    .orFail(() => {
        const error = new Error('Scoreboard not found.');
        throw error;
    })
    .then(scoreboard => {

        //@ts-ignore
        if (scoreboard.userExists(user.id)) {
            const error = new Error(`you've already joined ${scoreboard.name}`);
            throw error;
        }

        if (scoreboard.state != 'lobby') {
            const error = new Error('Scord alredy started');
            throw error;
        }

        scoreboard.players.push({
            id: user.id,
            name: user.name
        });

        return scoreboard.save();
    });
}

//need user id, and scoreboard id.
export function startScoreboard(req : Request, res : Response) {
    const { body } = req;
    const params = body.data.options[0].options[0];
    
    Scoreboards.findById(params.value)
    .orFail(() => {
        const error = new Error('Scoreboard not found');
        throw error;
    })
    .then(scoreboard => {

        //game cannot start if it has already started
        if (scoreboard.state != 'lobby') {
            const error = new Error('Scoreboard has already started.');
            throw error;
        }

        //only the user who created the scoreboard can start it.
        if (scoreboard.author != body.member.user.id) {
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

export function addPointScoreboard(body : Interaction, res : Response) {
    const { scoreboard_id, user_id, value = 1 } = body.options;

    updateScore(scoreboard_id, user_id, value)
    .then(result => {
        res.send({
            type: 4,
            data: {
                content: `${result.caller.name} now has ${result.caller.score} points!`,
                flags: 64
            }
        })
    })
    .catch(err => {
        res.send({
            type: 4,
            data: {
                content: err.message,
                flags: 64
            }
        })
    })    
}

//peek scoreboard currently shows the top 3 players and the player's position
export function peekScoreboard(body : Interaction, res : Response) {
    //get the scoreboard id
    //get the top 3 players
    //get the player's position

    const { scoreboard_id } = body.options;
    getPlayerPositions(scoreboard_id, 5, body.user.id)
    .then((players) => {
        const options : LeaderboardOptions = {
            visibleOnlyToCaller: false,
            specialHighlighting: []
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

export function interfaceScoreboard(body : Interaction, res : Response) {
    const { scoreboard_id } = body.options;
    getPlayerPositions(scoreboard_id, 10, body.user.id)
    .then((players) => {
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