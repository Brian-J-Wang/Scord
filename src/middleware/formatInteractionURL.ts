import { NextFunction, Request, Response } from "express";

interface DiscordOption {
    name : string,
    type : number,
    value : any
}

//formats the interaction url.
// url will be /{interactionType}/{interactionName}
export function formatInteractionURL(req : Request, res : Response, next : NextFunction) {

    const interactionType = getInteractionType(req.body.type);
    const interactionName = getInteractionName(req.body.type, req.body);

    req.url = `/${interactionType}/${interactionName}`

    next();
}

function getInteractionType(type : number) {
    switch(type) {
        case 1:
            return 'ping';
        case 2:
            return 'app';
        case 3:
            return 'component';
        case 4:
            return 'autocomplete';
        case 5:
            return 'modal';
        default:
            return 'ping';
    }
}

function getInteractionName(type : number, body : any) {
    if (type == 2) {
        return body.data.options[0].name;
    } else if (type == 3) {
        return body.data.custom_id.split(':')[0];
    } else if (type == 4) {
        return body.data.options[0].options.find((element : any) => element.focused).name;
    }
}