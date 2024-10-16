import playerDataSchema from './playerData';
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

scoreboardSchema.methods.getTopPlayer = function getTopPlayer() {
}

scoreboardSchema.methods.getTop3Playes = function getTop3Playes(scoreboard_id) {
    this.find()
}

scoreboardSchema.methods.getPosition = function getPosition(id) {
}

scoreboardSchema.methods.userExists = function userExists(id) {
    return this.players.find((player) => {
        return player.id == id;
    }) != undefined;
};

//id is the discord user id
scoreboardSchema.methods.getUser = function getUser(id) {
    return this.players.find(player => player.id == id);
}

const Scoreboard = mongoose.model('scoreboards', scoreboardSchema);

export default Scoreboard;

//returns the top {limit} of players and the position of the caller
export function getPlayerPositions(scoreboard_id, limit, caller_id) {
    return Scoreboard.findOne({ _id: scoreboard_id}, { name: 1, players: 1, _id: 0 })
    .orFail(() => {
        const error = new Error('Scoreboard was not found');
        throw error;
    })
    .then((result) => {
        let { players } = result;

        const top = players.slice(0, limit);
        const caller = players.find((player) => {
            return player.id == caller_id;
        })

        return {
            name: result.name,
            top : top,
            caller : caller
        }
    })
}

//sorting is only necessary whenever the score gets updated. 
export function updateScore(scoreboard_id, user, amount) {
    return Scoreboard.findById(scoreboard_id, { state: 1, players: 1 })
    .orFail(() => {
        const error = new Error('Scoreboard was not found');
        throw error;
    })
    .then((result) => {
        if (result.state == 'lobby') {
            const error = new Error('The scoreboard has not started yet!');
            throw error;
        } else if (result.state == 'complete') {
            const error = new Error('The scoreboard has been completed!');
            throw error;
        }

        let { players } = result;

        let scoringPlayer = players.find((player) => { return player.id == user; });

        if (scoringPlayer == undefined) {
            const error = new Error('Player was not found');
            throw error;
        }

        scoringPlayer.score += amount;

        players.sort((a, b) => b.score - a.score);

        players.forEach((player, index) => {
            player.position = index + 1;
        })

        result.save();

        return scoringPlayer;
    })
}


