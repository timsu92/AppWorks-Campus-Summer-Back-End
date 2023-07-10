import assert from "assert";
import z from "zod";
import bcrypt from 'bcrypt';
/// <reference path="../util/types/apiResponse.d.ts" />
import * as jwt from "./jwt.js";
const saltRounds = 10;
export default function (sql) {
    return function (req, res, next) {
        if (req.headers["content-type"] !== "application/json") {
            res.status(400).send({ error: "invalid content type" });
        }
        const bodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string(),
        });
        const parsedReq = bodySchema.safeParse(req.body);
        if (parsedReq.success) {
            sql.query("SELECT email FROM user WHERE email = ?", [parsedReq.data.email], async function (err, result, fields) {
                if (err) {
                    console.warn(`sql query error on 'SELECT email FROM user WHERE email = ${parsedReq.data.email}'`, err);
                    res.status(500).send("sql error");
                }
                else {
                    const emails = result;
                    if (emails.length > 0) {
                        console.log(`trying to register duplicated ${parsedReq.data.email}`);
                        res.status(403).send({ error: `${parsedReq.data.email} already registered` });
                    }
                    else {
                        sql.query("INSERT INTO user (provider, name, email, picture, password) VALUES ('', ?, ?, '', ?)", [parsedReq.data.name, parsedReq.data.email, await bcrypt.hash(parsedReq.data.password, saltRounds)], function (err, result, fields) {
                            if (err) {
                                res.status(403).send({ error: `${parsedReq.data.email} already registered` });
                            }
                            else if (result.affectedRows === 1) {
                                sql.query('SELECT id,provider,email,name,picture FROM user WHERE id = ?', [result.insertId], async function (err, result, fields) {
                                    assert(err === null);
                                    const usrObj = result;
                                    res.status(200).send({
                                        "access_token": await jwt.encode(usrObj[0]),
                                        "user": usrObj[0]
                                    });
                                    console.log("registered ", usrObj[0]);
                                });
                            }
                        });
                    }
                }
            });
        }
        else {
            console.warn("fail registering ", req.body);
            console.warn("\treason:\n", parsedReq.error.message);
            res.status(400).send({ error: parsedReq.error.message });
        }
    };
}
