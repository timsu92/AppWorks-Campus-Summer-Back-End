import assert from "assert";

import express from "express";
import z from "zod";
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

import * as jwt from "./jwt.js";

const saltRounds = 10;

export default function (sql: mysql.Connection | mysql.Pool) {
  return function (req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.headers["content-type"] !== "application/json") {
      res.status(400).send({ error: "invalid content type" });
    }

    const bodySchema = z.object({
      name: z.string().nonempty(),
      email: z.string().nonempty().email(),
      password: z.string().nonempty(),
    });

    const parsedReq = bodySchema.safeParse(req.body);
    if (parsedReq.success) {
      sql.query("SELECT email FROM user WHERE email = ?", [parsedReq.data.email], async function (err, result, fields) {
        if (err) {
          console.warn(`sql query error on 'SELECT email FROM user WHERE email = ${parsedReq.data.email}'`, err);
          res.status(500).send({ error: "sql error" });
        } else {
          const emails = result as { email: string }[];
          if (emails.length > 0) {
            console.log(`trying to register duplicated ${parsedReq.data.email}`);
            res.status(403).send({ error: `${parsedReq.data.email} already registered` });
          } else {
            const passwd = await bcrypt.hash(parsedReq.data.password, saltRounds);
            sql.query("INSERT INTO user (provider, name, email, password) VALUES ('native', ?, ?, ?)",
              [parsedReq.data.name, parsedReq.data.email, passwd],
              async function (err, result: mysql.ProcedureCallPacket<mysql.ResultSetHeader>, fields) {
                if (err) {
                  // ex result: Duplicate entry 'test@test.com' for key 'user.email'
                  res.status(403).send({ error: `${parsedReq.data.email} already registered` });
                } else if (result.affectedRows === 1) {
                  const usrObj: Canchu.IUserObject = {
                    "id": result.insertId,
                    "name": parsedReq.data.name,
                    "email": parsedReq.data.email,
                    "picture": "",
                    "provider": "native"
                  };
                  res.status(200).send({
                    "data":{
                      // {[key: string]: any}只是為了滿足型態檢查，實際上不會沒事接受任意key
                      "access_token": await jwt.encode(usrObj as Canchu.IUserObject & {[key: string]: any}),
                      "user": usrObj
                    }
                  });
                  console.log("registered ", usrObj);
                }
              });
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
