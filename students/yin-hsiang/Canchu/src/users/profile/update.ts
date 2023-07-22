import express from 'express';
import mysql from 'mysql2';
import jose from 'jose';
import z from "zod";

import * as jwt from '../jwt.js';

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
    let payload = { "id": 0 };
    try {
      payload = (await jwt.decode(access_token)).payload as { "id": number } & jose.JWTPayload;
    } catch (err) {
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
    sql.query("UPDATE user SET name=?, introduction=?, tags=? WHERE id=?",
      [body.data.name, body.data.introduction, body.data.tags, payload.id],
      function (err, result: mysql.ProcedureCallPacket<mysql.ResultSetHeader>) {
        if (err) {
          res.status(500).send({ "error": "internal database error" });
          console.error(`error while executing 'UPDATE user SET name=${body.data.name}, introduction=${body.data.introduction}, tags=${body.data.tags} WHERE id=${payload.id}'\n`, err);
        } else if (result.affectedRows === 0) {
          res.status(403).send({ "error": "Wrong token" });
        } else {
          res.status(200).send({ "data": { "user": { "id": payload.id } } });
          console.log(`user with id ${payload.id} changed profile to`, body.data);
          next();
        }
      })
  }
}
