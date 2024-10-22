import { Request, Response } from "express";
import Scoreboards from "../Models/scoreboard";

export function getGuildScoreboards(req : Request, res : Response) {
    console.log(req.body);

    let response = [];

    Scoreboards.find({guild: req.body.guild})
    .then(scoreboards => {

        response = scoreboards.map((scoreboard) => {
            return {
                name: scoreboard.name,
                value: scoreboard._id
            };
        });

        res.send({
            type: 8,
            data: {
                choices: response
            }
        });
    })
    .catch((err) => {
        console.log(err);
    })
}

export function getUsersFromScoreboard(req : Request, res : Response) {
    let response = [];

    Scoreboards.findById(req.body.options.scoreboard_id)
    .orFail(() => {
        const err = new Error('Scoreboard was not found');
        throw err;
    })
    .then((scoreboard) => {
        response = scoreboard.players.map((player) => {
            return {
                name: player.name,
                value: player.id.toString()
            }
        })

        res.send({
            type: 8,
            data: {
                choices: response
            }
        });
    })
    .catch((err) => {
        console.log(err);
    })
}