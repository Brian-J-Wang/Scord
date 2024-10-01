const mongoose = require('mongoose')

const playerDataSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        immutable: true,
    },
    score: {
        type: Number,
        required: true,
        default: 0
    }
})

export default playerDataSchema;