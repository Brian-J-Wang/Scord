import playerDataSchema from "./playerData";
const mongoose = require('mongoose');

/*
{
    guild: the id of the server this scoreboard belongs to
    name: the name of the server
    users: the users that are participating in this scoreboard
            {
                id: the discord id
                score: the score of this user
            }
    
}
*/


const scoreboardSchema = new mongoose.Schema({
    guild: {
        type: Number,
        required: true,
        immutable: true
    },
    author: {
        type: Number,
        required: true,
        immutable: true
    },
    name: {
        type: String,
        required: true,
        immutable: true
    },
    state: {
        type: String,
        enum: ['lobby', 'active', 'complete'],
        default: 'lobby'
    },
    players: [playerDataSchema]
});


scoreboardSchema.methods.userExists = function userExists(id) {
    return this.players.find((player) => {
        return player.id == id;
    }) != undefined;
};

//id is the discord user id
scoreboardSchema.methods.getUser = function getUser(id) {
    return this.players.find(player => player.id == id);
}

// user : { name : string, id : number}, scoreboard_id : string
scoreboardSchema.statics.addUserToScoreboard = function addUserToScoreboard(user, scoreboard_id) {
    return this.findOne({ _id : scoreboard_id})
    .orFail(() => {
        throw ScoreboardNotFoundError;
    })
    .then((scoreboard) => {
        if (scoreboard.userExists(user.id)) {
            const error = new Error(`You have already joined ${scoreboard.name}`);
            throw error;
        }

        if (scoreboard.state != 'lobby') {
            const error = new Error('This Scoreboard has already started');
            throw error
        }

        scoreboard.players.push({
            id: user.id,
            name: user.name
        });

        return scoreboard.save();

    });
}

scoreboardSchema.statics.updateScore = function updateScore(scoreboard_id, caller_id, amount) {
    return this.findById(scoreboard_id, { state: 1, name: 1, players: 1 })
    .orFail(() => {
        throw ScoreboardNotFoundError;
    })
    .then((scoreboard) => {
        if (scoreboard.state == 'lobby') {
            const error = new Error('The scoreboard has not started yet!');
            throw error;
        } else if (scoreboard.state == 'complete') {
            const error = new Error('The scoreboard has been completed!');
            throw error;
        }

        let { players } = scoreboard;

        let caller = players.find((player) => { return player.id == caller_id; });

        if (caller == undefined) {
            const error = new Error('Player was not found');
            throw error;
        }

        caller.score += amount;

        players.sort((a, b) => b.score - a.score);

        players.forEach((player, index) => {
            player.position = index + 1;
        })

        scoreboard.save();

        return {
            scoreboard_name: scoreboard.name,
            caller: caller,
            top: players
        };
    })
}

scoreboardSchema.statics.getPlayerPositions = function getPlayerPositions(scoreboard_id, limit, caller_id) {
    return this.findOne({ _id: scoreboard_id}, { name: 1, players: 1, _id: 0 })
    .orFail(() => {
        throw ScoreboardNotFoundError;
    })
    .then((scoreboard) => {
        let { players } = scoreboard;

        const top = players.slice(0, limit);
        const caller = players.find((player) => {
            return player.id == caller_id;
        })

        return {
            scoreboard_name: scoreboard.name,
            top : top,
            caller : caller
        }
    })
}

const Scoreboards = mongoose.model('scoreboards', scoreboardSchema);

export default Scoreboards;