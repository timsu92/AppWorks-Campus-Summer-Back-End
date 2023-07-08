import express from 'express';
import mysql from 'mysql2';
import z from 'zod';
import jose from 'jose';

import { CanchuZod } from '../util/types/api.js';
import * as jwt from './jwt.js';

type oSuccess = {
  "data": {
    "user": Canchu.IUserDetailObject
  }
}

type oError = {
  "error": string
}

export default function (sql: mysql.Connection | mysql.Pool) {
  return async function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction): Promise<void> {
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
      const usrDetailObj = (await jwt.decode(access_token)).payload as Canchu.IUserDetailObject & jose.JWTPayload;
      if (!CanchuZod.UserDetailObject.safeParse(usrDetailObj).success) {
        res.status(403).send({ "error": "Wrong token" });
      } else {
        res.status(200).send({
          "data": {
            "user": usrDetailObj
          }
        });
      }
    } catch (err) {
      res.status(403).send({ "error": "Can't parse token" });
    }
  }
}
