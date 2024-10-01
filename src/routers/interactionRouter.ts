import { InteractionType } from 'discord-interactions';
import express from 'express';
import pong from '../controller/pong'
import { joinThroughCommand , newScoreboard, newScoreboardResponse } from '../controller/ScoreboardController';
const router = express.Router();

router.use('/', (req, res) => {
    const interaction = req.body.type;

    if (interaction == InteractionType.PING ) {
        pong(req, res);
    } else if (interaction == InteractionType.APPLICATION_COMMAND) {
        const command = req.body.data.options[0].name;

        console.log(command);

        if (command == 'new') {
            newScoreboard(req, res);
        } else if (command == 'join') {
            joinThroughCommand(req, res);
        }
    } else if (interaction == InteractionType.MESSAGE_COMPONENT) {
        const context = req.body.message.interaction.name;

        if (context == 'scoreboard new') {
            newScoreboardResponse(req, res);
        }
    }
})

export default router;