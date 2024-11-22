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
const port = Number.parseInt(process.env.port ?? '3000') ;

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

const httpOptions = {
    key: readFileSync('/etc/letsencrypt/live/interaction.scordboard.com/privkey.pem'),
    cert: readFileSync('/etc/letsencrypt/live/interaction.scordboard.com/cert.pem'),
    ca: readFileSync('/etc/letsencrypt/live/interaction.scordboard.com/fullchain.pem'),
}

createServer(httpOptions, app).listen(port, '0.0.0.0', () => {
    console.log(`listening in on port ${port}`);
})