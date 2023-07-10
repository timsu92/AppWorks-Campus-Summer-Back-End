import express from 'express';
import mysql from 'mysql2';
import jose from 'jose';
import z from "zod";

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
      const payload = (await jwt.decode(access_token)).payload as { "id": number } & jose.JWTPayload;
      if (!z.number().nonnegative().int().safeParse(payload.id).success) {
        res.status(403).send({ "error": "Wrong token" });
      } else {
        sql.query("SELECT id FROM user WHERE id=?",
          [payload.id],
          function (err, result, fields) {
            if (err) {
              res.status(500).send({ "error": "internal database error" });
              console.error(`error while executing SELECT id,name,picture,friend_count,introduction,tags,friendship FROM user WHERE id=${payload.id}`);
              return;
            }
            const qryResult = result as {"id": number}[];
            if(qryResult.length !== 1){
              res.status(403).send({"error": "invalid token"});
              return;
            }
            sql.query("SELECT id,name,picture,introduction,tags FROM user WHERE id=?",
              [req.params.id],
              function (err, result, fields) {
                if (err) {
                  res.status(500).send({ "error": "internal database error" });
                  console.error(`error while executing "SELECT id,name,picture,introduction,tags FROM user WHERE id=${req.params.id}"`);
                  return;
                }
                const usrDetailObjs = (result as Canchu.IUserDetailObject[]).map(fakeObj => {
                  return {
                    ...fakeObj,
                    "friend_count": 0,
                    "friendship": null
                  }
                });
                if (usrDetailObjs.length !== 1) {
                  res.status(404).send({ "error": "user not found" });
                  return;
                }
                res.status(200).send({ "data": { "user": usrDetailObjs[0] } });
              }
            )
          })
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
    let payload = {"id": 0};
    try {
      payload = (await jwt.decode(access_token)).payload as {"id": number} & jose.JWTPayload;
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
          console.log(`user with id ${payload.id} changed profile to ${body.data}`);
          next();
        }
      })
  }
}
