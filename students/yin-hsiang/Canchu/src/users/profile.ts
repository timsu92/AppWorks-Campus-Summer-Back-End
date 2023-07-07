import assert from 'assert';

import express from 'express';
import mysql from 'mysql2';
import z from 'zod';
import jose from 'jose';

import * as jwt from './jwt.js';

type oSuccess = {
  "data": {
    "user": Canchu.IUserDetailObject
  }
}

type oError = {
  "error": string
}

const zUserObject = z.object({
  "id": z.number().int(),
  "provider": z.enum(["native", "facebook"]),
  "email": z.string().email(),
  "name": z.string().nonempty(),
  "picture": z.string()
});

export default function (sql: mysql.Connection | mysql.Pool) {
  return async function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction): Promise<void> {
    if (Number.isNaN(+req.params.id)) {
      res.status(400).send({ "error": "invalid id" });
      return;
    }
    const access_token = (req.headers["authorization"] ?? "").match(/(?<=Bearer ).+/)?.[0];
    if (access_token === undefined) {
      res.status(401).send({ "error": "No token" });
      return;
    }
    try {
      const usrObj = (await jwt.decode(access_token)).payload as Canchu.IUserObject & jose.JWTPayload;
      if (!zUserObject.safeParse(usrObj).success) {
        res.status(403).send({ "error": "Wrong token" });
      } else {
        res.status(200).send({
          "data": {
            "user": {
              "id": usrObj.id,
              "name": usrObj.name,
              "picture": usrObj.picture,
              "friend_count": 0, // skip first
              "introduction": "",
              "tags": "",
              "friendship": null // skip first
            }
          }
        });
      }
    } catch (err) {
      res.status(403).send({ "error": "Can't parse token" });
    }
  }
}
