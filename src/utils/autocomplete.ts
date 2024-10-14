import { Autocomplete, Interaction } from "./parseInteraction";
import { Response } from "express";
import Scoreboard from "../Models/scoreboard";

function getGuildScoreboards(body : Interaction & Autocomplete, res : Response ) {
    Scoreboard.find({ guild: body.guild})
    .then(scoreboard => {
        console.log(scoreboard);
    })
}