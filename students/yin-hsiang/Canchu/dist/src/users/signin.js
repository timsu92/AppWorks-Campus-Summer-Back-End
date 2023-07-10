import z from "zod";
import bcrypt from 'bcrypt';
import * as jwt from "./jwt.js";
export default function (sql) {
    return function (req, res, next) {
        if (req.headers["content-type"] !== "application/json") {
            res.status(400).send({ error: "invalid content type" });
        }
        const bodySchema = z.discriminatedUnion("provider", [
            z.object({
                "provider": z.literal("native"),
                "email": z.string().email(),
                "password": z.string().nonempty()
            }),
            z.object({
                "provider": z.literal("facebook"),
                "access_token": z.string().nonempty()
            })
        ]);
        const parsedBody = bodySchema.safeParse(req.body);
        if (parsedBody.success) {
            // TODO: 暫時先略過facebook登入 <07-07-23, timsu92> //
            if (parsedBody.data.provider === "native") {
                const parsedData = parsedBody.data;
                sql.query("SELECT id,provider,email,name,picture,password FROM user WHERE email=?", [parsedData.email], async function (err, result, fields) {
                    if (err) {
                        res.status(500).send({ "error": "internal database error" });
                        console.error(`error while sql executing 'SELECT id,provider,email,name,picture,password FROM user WHERE email=${parsedData.email}'\n`, err);
                    }
                    else {
                        let usrObj = result;
                        if (usrObj.length === 0) {
                            res.status(403).send({ "error": "User Not Found" });
                        }
                        else if (await bcrypt.compare(parsedData.password, usrObj[0].password)) {
                            // @ts-expect-error
                            delete usrObj[0].password;
                            res.status(200).send({
                                "data": {
                                    "access_token": await jwt.encode({ "id": usrObj[0].id }),
                                    "user": usrObj[0]
                                }
                            });
                            next();
                        }
                        else {
                            res.status(403).send({ "error": "Wrong Password" });
                        }
                    }
                });
            }
            else {
                res.status(500).send({ "error": "login from facebook not supported" });
            }
        }
        else if (parsedBody.error.issues.find(issue => issue.path[0] === "provider")) {
            if (typeof req.body.provider === "string" && req.body.provider !== "") {
                res.status(403).send({ "error": "Wrong provider" });
            }
            else {
                res.status(400).send({ "error": "invalid provider" });
            }
        }
        else {
            res.status(400).send({ "error": parsedBody.error.message });
        }
    };
}
