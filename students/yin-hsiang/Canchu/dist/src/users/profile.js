import z from "zod";
import * as jwt from './jwt.js';
export function getUserProfile(sql) {
    return async function (req, res, next) {
        if (Number.isNaN(+req.params.id)) {
            res.status(400).send({ "error": "invalid id" });
            return;
        }
        const access_token = (req.headers["authorization"] ?? "").match(/(?<=^Bearer ).+/)?.[0];
        if (access_token === undefined) {
            res.status(401).send({ "error": "No token" });
            return;
        }
        try {
            const payload = (await jwt.decode(access_token)).payload;
            if (!z.number().nonnegative().int().safeParse(payload.id).success) {
                res.status(403).send({ "error": "Wrong token" });
            }
            else {
                sql.query("SELECT id FROM user WHERE id=?", [payload.id], function (err, result, fields) {
                    if (err) {
                        res.status(500).send({ "error": "internal database error" });
                        console.error(`error while executing SELECT id,name,picture,friend_count,introduction,tags,friendship FROM user WHERE id=${payload.id}`);
                        return;
                    }
                    const qryResult = result;
                    if (qryResult.length !== 1) {
                        res.status(403).send({ "error": "invalid token" });
                        return;
                    }
                    sql.query("SELECT id,name,picture,introduction,tags FROM user WHERE id=?", [req.params.id], function (err, result, fields) {
                        if (err) {
                            res.status(500).send({ "error": "internal database error" });
                            console.error(`error while executing "SELECT id,name,picture,introduction,tags FROM user WHERE id=${req.params.id}"`);
                            return;
                        }
                        const usrDetailObjs = result.map(fakeObj => {
                            return {
                                ...fakeObj,
                                "friend_count": 0,
                                "friendship": null
                            };
                        });
                        if (usrDetailObjs.length !== 1) {
                            res.status(404).send({ "error": "user not found" });
                            return;
                        }
                        res.status(200).send({ "data": { "user": usrDetailObjs[0] } });
                    });
                });
                next();
            }
        }
        catch (err) {
            res.status(403).send({ "error": "Can't parse token" });
        }
    };
}
export function updateUserProfile(sql) {
    const iBodyZ = z.object({
        "name": z.string().nonempty(),
        "introduction": z.string(),
        "tags": z.string()
    });
    return async function (req, res, next) {
        if (req.headers["content-type"] !== "application/json") {
            res.status(400).send({ error: "invalid content type" });
            return;
        }
        const access_token = (req.headers["authorization"] ?? "").match(/(?<=^Bearer ).+/)?.[0];
        if (access_token === undefined) {
            res.status(401).send({ "error": "No token" });
            return;
        }
        let payload = { "id": 0 };
        try {
            payload = (await jwt.decode(access_token)).payload;
        }
        catch (err) {
            res.status(403).send({ "error": "Can't parse token" });
            return;
        }
        if (!z.number().nonnegative().int().safeParse(payload.id).success) {
            res.status(403).send({ "error": "invalid token format" });
            return;
        }
        const body = iBodyZ.safeParse(req.body);
        if (!body.success) {
            res.status(400).send({ "error": body.error.message });
            return;
        }
        sql.query("UPDATE user SET name=?, introduction=?, tags=? WHERE id=?", [body.data.name, body.data.introduction, body.data.tags, payload.id], function (err, result) {
            if (err) {
                res.status(500).send({ "error": "internal database error" });
                console.error(`error while executing 'UPDATE user SET name=${body.data.name}, introduction=${body.data.introduction}, tags=${body.data.tags} WHERE id=${payload.id}'\n`, err);
            }
            else if (result.affectedRows === 0) {
                res.status(403).send({ "error": "Wrong token" });
            }
            else {
                res.status(200).send({ "data": { "user": { "id": payload.id } } });
                console.log(`user with id ${payload.id} changed profile to ${body.data}`);
                next();
            }
        });
    };
}
