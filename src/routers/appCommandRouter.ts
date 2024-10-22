import express from "express"
import { parseInteraction } from "../utils/parseInteraction";
import { addPointScoreboard, interfaceScoreboard, JoinScoreboard, NewScoreboard, peekScoreboard, startScoreboard } from "../controller/appCommandController";

const appCommandRouter = express.Router();

appCommandRouter.use((req, res, next) => {
    req.body = parseInteraction(req.body);

    next();
});

appCommandRouter.post('/new', NewScoreboard);

appCommandRouter.post('/join', JoinScoreboard);

appCommandRouter.post('/start', startScoreboard);

appCommandRouter.post('/add', addPointScoreboard);

appCommandRouter.post('/interface', interfaceScoreboard);

appCommandRouter.post('/peek', peekScoreboard);

export default appCommandRouter;

