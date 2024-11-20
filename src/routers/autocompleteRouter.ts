import express from "express";
import { Request, Response } from "express";
import { parseAutocomplete, parseInteraction } from "../utils/parseInteraction";
import Scoreboards from "../models/scoreboard";
import { getGuildScoreboards, getUsersFromScoreboard } from "../controller/autocompleteController";

const autocompleteRouter = express.Router();

autocompleteRouter.use((req, res, next) => {
    req.body = parseAutocomplete(req.body);

    next();
});

autocompleteRouter.use('/scoreboard_id', getGuildScoreboards);
 
autocompleteRouter.use('/user_id', getUsersFromScoreboard);

export default autocompleteRouter;

