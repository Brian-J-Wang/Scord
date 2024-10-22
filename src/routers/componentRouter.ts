import express from 'express';
import { parseComponent } from '../utils/parseInteraction';
import { decreaseScore, increaseScore, joinScoreboard } from '../controller/componentController';

const componentRouter = express.Router();

componentRouter.use((req, res, next) => {
    req.body = parseComponent(req.body);

    next();
})

componentRouter.post('/join', joinScoreboard);

componentRouter.post('/inc', increaseScore);

componentRouter.post('/dec', decreaseScore);

export default componentRouter;