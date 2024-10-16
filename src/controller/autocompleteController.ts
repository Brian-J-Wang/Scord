import { Request, Response } from "express";
import Scoreboard from "../Models/scoreboard";
import { Interaction, Autocomplete } from "../utils/parseInteraction";

export function addAutocomplete(body : Interaction & Autocomplete, res : Response) {
    if (body.focused == 'scoreboard_id') {
        let response = [];

        Scoreboard.find({guild: body.guild})
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
    }

    if (body.focused == 'user_id') {
        //get the name of the users from the active scoreboard...?

        let response = [];

        Scoreboard.findById(body.options.scoreboard_id)
        .orFail(() => {
            res.send({
                type: 8,
                data: {
                    choices: []
                }
            })

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
}

export function joinAutocomplete(body : Interaction & Autocomplete, res : Response) {
    //the focused body is known to be id
    let response = [];

    Scoreboard.find({guild: body.guild})
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
}

export function startAutocomplete(body : Interaction & Autocomplete, res : Response) {
    getScoreboardsFromGuild(body.guild)
    .then(results => {
        res.send({
            type: 8,
            data: {
                choices: results
            }
        }).end();
    })
}

export function peekAutocomplete(body : Interaction & Autocomplete, res : Response) {
    getScoreboardsFromGuild(body.guild)
    .then(results => {
        res.send({
            type: 8,
            data: {
                choices: results
            }
        }).end();
    })
}

function getScoreboardsFromGuild(guildId : string) {
    let response = [];

    return Scoreboard.find({guild: guildId})
    .then(scoreboards => {
        response = scoreboards.map((scoreboard) => {
            return {
                name: scoreboard.name,
                value: scoreboard._id
            };
        });

        return response;
    })
}

