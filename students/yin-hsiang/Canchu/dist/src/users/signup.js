import z from "zod";
import bcrypt from 'bcrypt';
import * as jwt from "./jwt.js";
import { User } from "../db/entity/user.js";
const saltRounds = 10;
export default async function (req, res, next) {
    if (req.headers["content-type"] !== "application/json") {
        res.status(400).send({ error: "invalid content type" });
    }
    const bodySchema = z.object({
        name: z.string().nonempty(),
        email: z.string().nonempty().email(),
        password: z.string().nonempty(),
    });
    const parsedReq = bodySchema.safeParse(req.body);
    if (parsedReq.success) {
        const newUser = new User();
        newUser.provider = "native";
        newUser.name = parsedReq.data.name;
        newUser.email = parsedReq.data.email;
        newUser.password = await bcrypt.hash(parsedReq.data.password, saltRounds);
        User.save(newUser)
            .then(async (newUser) => {
            const usrObj = {
                "id": newUser.id,
                "provider": newUser.provider,
                "email": newUser.email,
                "name": newUser.name,
                "picture": newUser.picture
            };
            res.status(200).send({
                "data": {
                    "access_token": await jwt.encode({ "id": usrObj.id }),
                    "user": usrObj
                }
            });
            console.log("registered", usrObj);
            next();
        })
            .catch((err) => {
            if (err.message === `Duplicate entry '${parsedReq.data.email}' for key 'user.email'`) {
                console.log(`trying to register duplicated ${parsedReq.data.email}`);
                res.status(403).send({ error: `${parsedReq.data.email} already registered` });
            }
            else {
                console.error("error while registering user\n", err);
                res.status(500).send({ "error": "internal database error" });
            }
        });
    }
    else {
        console.warn("fail registering ", req.body);
        console.warn("\treason:\n", parsedReq.error.message);
        res.status(400).send({ error: parsedReq.error.message });
    }
}
//# sourceMappingURL=signup.js.map