"use strict";
import Scoreboard from "../Models/scoreboard";
import { Request, Response } from "express";
const dotenv = require('dotenv');
dotenv.config();

export function newScoreboard(req: Request, res: Response) {
    const { body } = req;
    const params = body.data.options[0].options[0];

    console.log("creating new scoreboard");
    
    Scoreboard.create({
        guild: body.guild.id,
        author: body.member.user.id,
        name: params.value,
        players: []  
    }).then(scoreboard => {
        console.log(`scoreboard id:${scoreboard.id} has been created`);

        res.send({
            type: 4,
            data: {
                content: `Scoreboard ${scoreboard.name}:${scoreboard.id} has been created`,
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

export function newScoreboardResponse(req: Request, res: Response) {
    const { data } = req.body;

    //action_id[0] should be the action, action_id[1] should be the scoreboard;
    const action_id = data.custom_id.split(':');

    if (action_id[0] == 'join') {
        const userId = req.body.member.user.id;

        joinScoreboard(userId, action_id[1])
        .then((scoreboard: any) => {
            res.send({
                type: 7,
                data: {
                    content: `Scoreboard ${scoreboard.name}:${scoreboard.id} has been created. ${scoreboard.players.length} joined`,
                    components: [
                        {
                            "type" : 1,
                            components : [
                                {
                                    type: 2,
                                    custom_id: `join:${scoreboard.id}`,
                                    label: "join",
                                    style: 1,
                                }
                            ]
                        }   
                    ]
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
        })

        return;
    }
}

export function joinThroughCommand(req : Request, res : Response) {
    const userId = req.body.member.user.id;
    const scoreboardId = req.body.data.options[0].options[0].value;

    joinScoreboard(userId, scoreboardId)
    .then((scoreboard: any) => {
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
    })
}

//joining the scoreboard through this method will not update the original message that sent the scoreboard...
//need user id, and the scoreboard id.
    //any issues will return a error code,
function joinScoreboard(userId : number, scoreboardId : string ) : any {

    return Scoreboard.findById(scoreboardId)
    .orFail(() => {
        const error = new Error('Scoreboard not found');
        throw error;
    })
    .then(scoreboard => {

        //@ts-ignore
        if (scoreboard.userExists(userId)) {
            const error = new Error('User already joined');
            throw error;
        }

        if (scoreboard.state != 'lobby') {
            const error = new Error('Scord alredy started');
            throw error;
        }

        scoreboard.players.push({
            id: userId
        });

        return scoreboard.save();
    });
}