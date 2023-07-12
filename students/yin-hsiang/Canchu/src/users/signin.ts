import express from "express";
import z from "zod";
import bcrypt from 'bcrypt';

import * as jwt from "./jwt.js";
import { QueryFailedError } from "typeorm";
import { User } from "../db/entity/user.js";

type oSuccess = {
  "data": {
    "access_token": string,
    "user": Canchu.IUserObject
  }
}

type oError = {
  "error": string
}

export default function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction): void {
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
      User.findOneBy({ "email": parsedData.email })
        .then(async (usr) => {
          if (usr === null) {
            res.status(403).send({ "error": "User Not Found" });
            return;
          }
          if (await bcrypt.compare(parsedData.password, usr.password)) {
            res.status(200).send({
              "data": {
                "access_token": await jwt.encode({ "id": usr.id }),
                "user": {
                  "id": usr.id,
                  "name": usr.name,
                  "email": usr.email,
                  "provider": usr.provider,
                  "picture": usr.picture
                }
              }
            });
            next();
          } else {
            res.status(403).send({ "error": "Wrong Password" });
          }
        })
        .catch((err: QueryFailedError) => {
          res.status(500).send({ "error": "internal database error" });
          console.error(`error while searching for user\n${err}`);
          return;
        })
    } else {
      res.status(500).send({ "error": "login from facebook not supported" });
    }
  } else if (parsedBody.error.issues.find(issue => issue.path[0] === "provider")) {
    if (typeof req.body.provider === "string" && req.body.provider !== "") {
      res.status(403).send({ "error": "Wrong provider" });
    } else {
      res.status(400).send({ "error": "invalid provider" });
    }
  } else {
    res.status(400).send({ "error": parsedBody.error.message });
  }
};
