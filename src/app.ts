import express from "express";
import verify from "./middleware/verify";
import mongoose from 'mongoose';
import { formatInteractionURL } from "./middleware/formatInteractionURL";
import appCommandRouter from "./routers/appCommandRouter";
import autocompleteRouter from "./routers/autocompleteRouter";
import { InteractionResponseType } from "discord-interactions";
import componentRouter from "./routers/componentRouter";
import { readFileSync } from "fs";
import { createServer } from "https";

require('dotenv').config();

mongoose.connect(process.env.uri ?? '')
.then(() => {
    console.log("connected successfully to mongoDB");
}).catch(() => {
    console.error("cannot connect to database");
});

const app = express();
const port = getPort();

app.use(express.json());

app.use(verify);

app.use(formatInteractionURL);

app.use('/ping', (req, res) => {
    res.send(JSON.stringify({
        type: InteractionResponseType.PONG
    }));
});

app.use('/app', appCommandRouter);

app.use('/component', componentRouter)

app.use('/autocomplete', autocompleteRouter);

if (process.env.NODE_ENV == "development") {
    app.listen(port, () => {
        console.log(`Listening in on port: ${port}, DEV`)
    })
} else {
    let httpOptions = {}

    try {
        httpOptions = {
            key: readFileSync('/etc/letsencrypt/live/interaction.scordboard.com/privkey.pem'),
            cert: readFileSync('/etc/letsencrypt/live/interaction.scordboard.com/cert.pem'),
            ca: readFileSync('/etc/letsencrypt/live/interaction.scordboard.com/fullchain.pem'),
        };
    } catch (error) {
        console.log("Cannot find ssl certifications");
    }
    
    createServer(httpOptions, app).listen(port, '0.0.0.0', () => {
        console.log(`Listening in on port: ${port}, P`);
    });
}

function getPort(): number {
    if (process.env.NODE_ENV == "development") {
        return 3000;
    } else {
        return parseInt(process.env.port || "3000");
    }
}

function getDatabase(): string {
    if (process.env.NODE_ENV == "development") {
        return 'mongodb://localhost:27017/scoreboard_db';
    } else {
        return process.env.uri ?? '';
    }
}