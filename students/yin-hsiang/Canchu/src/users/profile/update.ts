import express from 'express';
import mysql from 'mysql2';
import z from "zod";

import { AccessTokenSuccessBody } from '../auth.js';

export function updateUserProfile(sql: mysql.Connection | mysql.Pool) {
  const iBodyZ = z.object({
    "name": z.string().nonempty(),
    "introduction": z.string(),
    "tags": z.string()
  })

  type iBody = {
    "name": any, // string
    "introduction": any, // string
    "tags": any, // string
  }

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

  return async function (
    req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody & iBody>,
    res: express.Response<oSuccess | oError>,
    next: express.NextFunction
  ) {
    const body = iBodyZ.safeParse(req.body);
    if (!body.success) {
      res.status(400).send({ "error": body.error.message });
      return;
    }
    const userId = req.body.loginUserId;
    sql.query("UPDATE user SET name=?, introduction=?, tags=? WHERE id=?",
      [body.data.name, body.data.introduction, body.data.tags, userId],
      function (err, result: mysql.ProcedureCallPacket<mysql.ResultSetHeader>) {
        if (err) {
          res.status(500).send({ "error": "internal database error" });
          console.error(`error while executing 'UPDATE user SET name=${body.data.name}, introduction=${body.data.introduction}, tags=${body.data.tags} WHERE id=${userId}'\n`, err);
        } else if (result.affectedRows === 0) {
          res.status(403).send({ "error": "Wrong token" });
        } else {
          res.status(200).send({ "data": { "user": { "id": userId } } });
          console.log(`user with id ${userId} changed profile to`, body.data);
          next();
        }
      })
  }
}
