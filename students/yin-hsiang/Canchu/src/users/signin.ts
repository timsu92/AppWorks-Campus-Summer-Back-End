import express from "express";
import z from "zod";
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

import * as jwt from "./jwt.js";

type oSuccess = {
  "data": {
    "access_token": string,
    "user": Canchu.IUserObject
  }
}

type oError = {
  "error": string
}

export default function (sql: mysql.Connection | mysql.Pool) {
  return function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction): void {
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
        sql.query("SELECT id,name,picture,password,introduction,tags FROM user WHERE email=?",
          [parsedData.email],
          async function (err, result, fields) {
            if (err) {
              res.status(500).send({ "error": "internal database error" });
              console.error(`error while sql executing 'SELECT id,name,picture,password,introduction,tags FROM user WHERE email=${parsedData.email}'\n`, err);
            } else {
              let qryResult = result as {
                id: number,
                name: string,
                picture: string,
                password: string,
                introduction: string,
                tags: string
              }[];
              if (qryResult.length === 0) {
                res.status(403).send({ "error": "User Not Found" });
              } else if (await bcrypt.compare(parsedData.password, qryResult[0].password)) {
                res.status(200).send({
                  "data": {
                    "access_token": await jwt.encode({ "id": qryResult[0].id }),
                    "user": {
                      "id": qryResult[0].id,
                      "provider": parsedData.provider,
                      "name": qryResult[0].name,
                      "email": parsedData.email,
                      "picture": qryResult[0].picture
                    }
                  }
                });
                next();
              } else {
                res.status(403).send({ "error": "Wrong Password" });
              }
            }
          }
        )
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
}
