import express from "express";
import z from "zod";
import bcrypt from 'bcrypt';

import * as jwt from "./jwt.js";
import { User } from "../db/entity/user.js";
import { QueryFailedError } from "typeorm";
import { armorUserPicture } from "../util/util.js";

const saltRounds = 10;

type oSuccess = {
  "data": {
    "access_token": string,
    "user": Canchu.IUserObject
  }
}

type oError = {
  "error": string
}

export default async function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction): Promise<void> {
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
        const usrObj: Canchu.IUserObject = {
          "id": newUser.id,
          "provider": newUser.provider,
          "email": newUser.email,
          "name": newUser.name,
          "picture": armorUserPicture(newUser.picture)
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
      .catch((err: QueryFailedError) => {
        if (err.message === `Duplicate entry '${parsedReq.data.email}' for key 'user.email'`) {
          console.log(`trying to register duplicated ${parsedReq.data.email}`);
          res.status(403).send({ error: `${parsedReq.data.email} already registered` });
        } else {
          console.error("error while registering user\n", err);
          res.status(500).send({ "error": "internal database error" });
        }
      })
  } else {
    console.warn("fail registering ", req.body);
    console.warn("\treason:\n", parsedReq.error.message);
    res.status(400).send({ error: parsedReq.error.message });
  }
}
