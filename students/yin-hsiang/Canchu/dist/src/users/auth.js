import * as jose from 'jose';
import z from 'zod';
import * as jwt from "./jwt.js";
export async function accessToken(req, res, next) {
    const access_token = (req.headers["authorization"] ?? "").match(/(?<=^Bearer ).+/)?.[0];
    if (access_token === undefined) {
        res.status(401).send({ "error": "No token" });
        return;
    }
    try {
        const payload = (await jwt.decode(access_token)).payload;
        if (!z.number().nonnegative().int().safeParse(payload["id"]).success) {
            res.status(403).send({ "error": "Wrong token format" });
            return;
        }
        req.body.loginUserId = payload.id;
        next();
    }
    catch (err) {
        if (err instanceof jose.errors.JOSEError) {
            res.status(403).send({ "error": "Invalid token" });
            return;
        }
        else {
            res.status(500).send({ "error": "Unknown error" });
            console.error("error while decoding access_token:", err);
            return;
        }
    }
}
//# sourceMappingURL=auth.js.map