import { updateScore } from "../Models/scoreboard";
import { Request, Response } from "express";
import { formatLeaderboard, Leaderboard, LeaderboardOptions } from "../utils/leaderboardFormatter";
import { Button, Interaction } from "../utils/parseInteraction";

export function updateScoreboard(interaction : Interaction & Button, res : Response) {

    const scoreboard_id = interaction.options[interaction.button];
    const user = interaction.user.id;
    const amount = interaction.button == 'inc' ? 1 : -1;
    
    updateScore(scoreboard_id, user, amount)
    .then((results) => {

        const options : LeaderboardOptions = {
            visibleOnlyToCaller: false,
            specialHighlighting: [
                {
                    playerId: Number.parseInt(user),
                    prefix: (amount == 1) ? '\u001b[0;32m' : '\u001b[0;31m',
                    suffix: "\u001b[0m"
                }
            ]
        };
        const message = formatLeaderboard(results as unknown as Leaderboard, options);

        res.send({
            type: 7,
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
        })
    })

}