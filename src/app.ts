import express from "express";
import verify from "./middleware/verify";
import router from "./routers/interactionRouter";
import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/scorebot_db');

const app = express();
const port = 3000

app.use(express.json());

app.use(verify);

app.post('/',router);

app.listen(port, () => {
    console.log(`listening in on port ${port}`);
})