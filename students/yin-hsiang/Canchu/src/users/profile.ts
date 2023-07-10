import express from 'express';
import mysql from 'mysql2';
import jose from 'jose';
import z from "zod";

import { CanchuZod } from '../util/types/api.js';
import * as jwt from './jwt.js';

export function getUserProfile(sql: mysql.Connection | mysql.Pool) {
  type oSuccess = {
    "data": {
      "user": Canchu.IUserDetailObject
    }
  }

  type oError = {
    "error": string
  }

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
        next();
      }
    } catch (err) {
      res.status(403).send({ "error": "Can't parse token" });
    }
  }
}

export function updateUserProfile(sql: mysql.Connection | mysql.Pool) {
  const iBodyZ = z.object({
    "name": z.string().nonempty(),
    "introduction": z.string(),
    "tags": z.string()
  })

  type oSuccess = {
    "data": {
      "user": {
        "id": number
      }
    }
  }

  type oError = {
    "error": string
  }

  return async function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction): Promise<void> {
    if (req.headers["content-type"] !== "application/json") {
      res.status(400).send({ error: "invalid content type" });
      return;
    }
    const access_token = (req.headers["authorization"] ?? "").match(/(?<=^Bearer ).+/)?.[0];
    if (access_token === undefined) {
      res.status(401).send({ "error": "No token" });
      return;
    }
    let payload;
    try {
      payload = (await jwt.decode(access_token)).payload;
    } catch (err) {
      res.status(403).send({ "error": "Can't parse token" });
      return;
    }
    const usrDetailObj = CanchuZod.UserDetailObject.safeParse(payload);
    if (!usrDetailObj.success) {
      res.status(403).send({ "error": "invalid token format" });
      return;
    }
    const body = iBodyZ.safeParse(req.body);
    if (!body.success) {
      res.status(400).send({ "error": body.error.message });
      return;
    }
    sql.query("UPDATE user SET name=?, introduction=?, tags=? WHERE id=?",
      [body.data.name, body.data.introduction, body.data.tags, usrDetailObj.data.id],
      function (err, result: mysql.ProcedureCallPacket<mysql.ResultSetHeader>) {
        if (err) {
          res.status(500).send({ "error": "internal database error" });
          console.error(`error while executing 'UPDATE user SET name=${body.data.name}, introduction=${body.data.introduction}, tags=${body.data.tags} WHERE id=${usrDetailObj.data.id}'\n`, err);
        } else if (result.affectedRows === 0) {
          res.status(403).send({ "error": "Wrong token" });
        } else {
          res.status(200).send({ "data": { "user": { "id": usrDetailObj.data.id } } });
          console.log(`user with id ${usrDetailObj.data.id} changed profile to ${body.data}`);
          next();
        }
      })
  }
}
