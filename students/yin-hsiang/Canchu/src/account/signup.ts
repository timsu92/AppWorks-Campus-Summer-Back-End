import assert from "assert";

import express from "express";
import z from "zod";
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

/// <reference path="../util/types/apiResponse.d.ts" />
import * as jwt from "./jwt.js";

const saltRounds = 10;

export default function (sql: mysql.Connection) {
  return function (req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.headers["content-type"] !== "application/json") {
      res.status(400).send({ error: "invalid content type" });
    }

    const bodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    });

    const parsedReq = bodySchema.safeParse(req.body);
    if (parsedReq.success) {
      sql.query("SELECT email FROM user WHERE email = ?", [parsedReq.data.email], async function (err, result, fields) {
        if (err) {
          console.warn(`sql query error on 'SELECT email FROM user WHERE email = ${parsedReq.data.email}'`, err);
          res.status(500).send("sql error");
        } else {
          const emails = result as { email: string }[];
          if (emails.length > 0) {
            console.log(`trying to register duplicated ${parsedReq.data.email}`);
            res.status(403).send({ error: `${parsedReq.data.email} already registered` });
          } else {
            sql.query("INSERT INTO user (provider, name, email, picture, password) VALUES ('', ?, ?, '', ?)",
              [parsedReq.data.name, parsedReq.data.email, await bcrypt.hash(parsedReq.data.password, saltRounds)],
              function (err, result: mysql.ProcedureCallPacket<mysql.ResultSetHeader>, fields) {
                if (err) {
                  // ex result: Duplicate entry 'test@test.com' for key 'user.email'
                  res.status(403).send({ error: `${parsedReq.data.email} already registered` });
                } else if (result.affectedRows === 1) {
                  sql.query('SELECT id,provider,email,name,picture FROM user WHERE id = ?',
                    [result.insertId],
                    async function (err, result, fields) {
                      assert(err === null);
                      // {[key: string]: any}只是為了滿足型態檢查，實際上不會沒事接受任意key
                      const usrObj = result as unknown as ({[key: string]: any} & Canchu.Api.Res.IUserObject)[];
                      res.status(200).send({
                        "access_token": await jwt.encode(usrObj[0]),
                        "user": usrObj[0]
                      });
                      console.log("registered ", usrObj[0]);
                    });
                }
              })
          }
        }
      })
    } else {
      console.warn("fail registering ", req.body);
      console.warn("\treason:\n", parsedReq.error.message);
      res.status(400).send({ error: parsedReq.error.message });
    }
  }
}
