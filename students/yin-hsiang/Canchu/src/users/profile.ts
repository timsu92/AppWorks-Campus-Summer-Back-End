import express from 'express';
import mysql from 'mysql2';
import jose from 'jose';
import z from "zod";
import { Equal } from 'typeorm';

import { User } from '../db/entity/user.js';
import { Friendship } from '../db/entity/friendship.js';
import * as jwt from './jwt.js';
import { AccessTokenSuccessBody } from './auth.js';
import { convertUserPicture } from '../util/util.js';

export function getUserProfile(sql: mysql.Connection | mysql.Pool) {
  type oSuccess = {
    "data": {
      "user": Canchu.IUserDetailObject
    }
  }

  type oError = {
    "error": string
  }

  return async function (
    req: express.Request<{ "id": any }, oSuccess | oError, AccessTokenSuccessBody>,
    res: express.Response<oSuccess | oError>,
    next: express.NextFunction
  ) {
    const targetUserId = +req.params.id;
    if (Number.isNaN(targetUserId)) {
      res.status(400).send({ "error": "invalid id" });
      return;
    }
    const usr = await User.findOne({
      "select": {
        "id": true, "name": true, "picture": true, "introduction": true, "tags": true, "friendCount": true
      },
      "where": { "id": Equal(targetUserId) },
    });
    if (usr === null) {
      res.status(404).send({ "error": "user not found" });
      return;
    }
    const friendship = (await Friendship.findOne({
      "select": { "id": true, "requesterId": true, "receiverId": true, "status": true },
      "where": [
        { "requesterId": Equal(targetUserId), "receiverId": Equal(req.body.loginUserId) },
        { "requesterId": Equal(req.body.loginUserId), "receiverId": Equal(targetUserId) },
      ]
    }));
    console.log(`user ${targetUserId}'s profile was got'`);
    return res.status(200).send({
      "data": {
        "user": {
          "id": usr.id,
          "name": usr.name,
          "picture": convertUserPicture(usr.picture),
          "friend_count": usr.friendCount,
          "introduction": usr.introduction,
          "tags": usr.tags,
          "friendship": friendship === null
            ? null
            : {
              "id": friendship.id,
              "status": friendship.status === "friend"
                ? "friend"
                : req.body.loginUserId === friendship.requesterId ? "requested" : "pending"
            }
        }
      }
    });
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
