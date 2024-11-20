import { Request, Response, NextFunction } from "express";
require('dotenv').config();
import nacl from "tweetnacl";

export default function verify(req: Request, res: Response, next : NextFunction) {
    console.log('verifying');

    const body = Buffer.from(JSON.stringify(req.body), "utf-8");

    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");
    // @ts-ignore
    const verified = nacl.sign.detached.verify( Buffer.from(timestamp + body), Buffer.from(signature, "hex"), Buffer.from(process.env.public_key, "hex"));

    if (!verified) {
        console.error('invalid request signature');
        res.status(401).send('invalid request signature').end();
    } else {
        next();
    }
}