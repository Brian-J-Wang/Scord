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

scoreboardSchema.methods.getTop3Playes = function getTop3Playes() {
}

scoreboardSchema.methods.getPosition = function getPosition(id) {
}

scoreboardSchema.methods.userExists = function userExists(id) {
    return this.players.find((player) => {
        return player.id == id;
    }) != undefined;
};

const Scoreboard = mongoose.model('scoreboards', scoreboardSchema);

export default Scoreboard;

