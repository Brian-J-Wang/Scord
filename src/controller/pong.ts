import { Request, Response } from "express";
import { InteractionResponseType } from "discord-interactions";

function pong(req : Request, res : Response) {
    res.send(JSON.stringify({
        type: InteractionResponseType.PONG
    })).end();
}

export default pong;