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

export function getTopPlayers(scoreboard_id, limit) {
    return Scoreboard.findOne({ _id: scoreboard_id}, { players: 1, _id: 0 })
    .orFail(() => {
        const error = new Error('Scoreboard was not found');
        throw error;
    })
    .then((result) => {
        let { players } = result;

        players = players.sort((a, b) => b.score - a.score );

        return players.slice(0, limit);
    })
}
