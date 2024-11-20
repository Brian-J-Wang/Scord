import express from "express";
import verify from "./middleware/verify";
import mongoose from 'mongoose';
import { formatInteractionURL } from "./middleware/formatInteractionURL";
import appCommandRouter from "./routers/appCommandRouter";
import autocompleteRouter from "./routers/autocompleteRouter";
import { InteractionResponseType } from "discord-interactions";
import componentRouter from "./routers/componentRouter";

require('dotenv').config();

mongoose.connect(process.env.uri ?? '')
.then(() => {
    console.log("connected successfully to mongoDB");
}).catch(() => {
    console.error("cannot connect to database");
});

const app = express();
const port = 3000

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

app.listen(port, () => {
    console.log(`listening in on port ${port}`);
})