import express from 'express';
import mysql from 'mysql2';

import env from "../../.env.json" assert {type: "json"};
import { AccessTokenSuccessBody } from './auth.js';

type oSuccess = { "data": { "users": Canchu.IUserSearchObject[] } }

type oError = { "error": string }

export default async function (
  req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody, { "keyword": unknown }>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const keyword = req.query.keyword;
  if (typeof keyword !== "string") {
    res.status(400).send({ "error": "no keyword provided in query" });
    return;
  }
  const userId = req.body.loginUserId;

  const conn = mysql.createConnection(env.sqlCfgOld);
  try {
    conn.query(`
      SELECT
        user.id as userId, user.name, user.picture, friendship.id as friendshipId, 
        CASE
          WHEN friendship.status = 'friend' THEN 'friend'
          WHEN friendship.status = 'requested' AND friendship.requesterId = ? AND friendship.receiverId = user.id THEN 'requested'
          WHEN friendship.status = 'requested' AND friendship.requesterId = user.id AND friendship.receiverId = ? THEN 'pending'
          ELSE null
        END AS relationship
      FROM
        user
      LEFT JOIN friendship ON (friendship.requesterId = user.id AND friendship.receiverId = ?)
                           OR (friendship.requesterId = ? AND friendship.receiverId = user.id)
      WHERE
        user.name LIKE '%test%'
        AND user.id != ?`,
      [userId, userId, userId, userId, userId],
      function (err, _result, fields) {
        if (err) {
          res.status(500).send({ "error": "Internal database error" });
          console.error("Error when searching for user:", err);
          conn.destroy();
          return;
        } else {
          const result = _result as {
            "userId": number,
            "name": string,
            "picture": string,
            "friendshipId": number,
            "relationship": "friend" | "requested" | "pending" | null
          }[];
          res.status(200).send({
            "data": {
              "users": result.map(record => {
                return {
                  "id": record.userId,
                  "name": record.name,
                  "picture": record.picture,
                  "friendship": record.relationship === null ? null : {
                    "id": record.friendshipId,
                    "status": record.relationship
                  }
                };
              })
            }
          });
          conn.destroy();
          next();
        }
      }
    )
  } catch (err) {
    conn.destroy();
    return;
  }
}
