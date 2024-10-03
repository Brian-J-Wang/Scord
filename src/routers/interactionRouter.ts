import { InteractionType } from 'discord-interactions';
import express from 'express';
import pong from '../controller/pong'
import { joinScoreboard, newScoreboard, startScoreboard } from '../controller/ScoreboardController';
import parseInteraction, { parseMessageComponent } from '../utils/parseInteraction';
const router = express.Router();

router.use('/', (req, res) => {
    const interactionType = req.body.type;

    if (interactionType == InteractionType.PING ) {
        pong(req, res);
    } else if (interactionType == InteractionType.APPLICATION_COMMAND) {
        const interaction = parseInteraction(req.body);

        if (interaction.name == 'new') {
            newScoreboard(interaction, res);
        } else if (interaction.name == 'join') {
            joinScoreboard(interaction, res);
        } else if (interaction.name == 'start') {
            startScoreboard(req, res);
        }
    } else if (interactionType == InteractionType.MESSAGE_COMPONENT) {
        console.log(req.body);
        const interaction = parseMessageComponent(req.body);

        if (interaction.name == 'scoreboard new') {
            if (interaction.button == 'join') {
                joinScoreboard(interaction, res);
            }
        }
    } else if (interactionType == InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
        const interaction = parseInteraction(req.body);

        if (interaction.name = 'add') {
            
        }

    }
})

export default router;