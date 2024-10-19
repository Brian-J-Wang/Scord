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


scoreboardSchema.methods.userExists = function userExists(id) {
    return this.players.find((player) => {
        return player.id == id;
    }) != undefined;
};

//id is the discord user id
scoreboardSchema.methods.getUser = function getUser(id) {
    return this.players.find(player => player.id == id);
}

const Scoreboards = mongoose.model('scoreboards', scoreboardSchema);

export default Scoreboards;

//returns the top {limit} of players and the position of the caller
export function getPlayerPositions(scoreboard_id, limit, caller_id) {
    return Scoreboards.findOne({ _id: scoreboard_id}, { name: 1, players: 1, _id: 0 })
    .orFail(() => {
        const error = new Error('Scoreboard was not found');
        throw error;
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


// {
//     newPlayers:
//     scoringPlayer:
// }
//sorting is only necessary whenever the score gets updated. 
export function updateScore(scoreboard_id, caller_id, amount) {
    return Scoreboards.findById(scoreboard_id, { state: 1, name: 1, players: 1 })
    .orFail(() => {
        const error = new Error('Scoreboard was not found');
        throw error;
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


