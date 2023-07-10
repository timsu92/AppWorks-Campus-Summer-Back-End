import express from 'express';
import mysql from 'mysql2';
import multer from 'multer';

import { CanchuZod } from '../util/types/api.js';
import env from '../../.env.json' assert {type: "json"};
import * as jwt from './jwt.js';

export default function (sql: mysql.Connection | mysql.Pool) {
  type oSuccess = {
    "data": {
      "picture": string
    }
  }

  type oError = {
    "error": string
  }

  // get image from field "picture" of body and save them to static folder
  const uploader = multer({ dest: 'static/' }).single('picture');

  return async function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction) {
    if (req.headers["content-type"] === undefined || !req.headers["content-type"].startsWith("multipart/form-data")) {
      console.log("header:", req.headers["content-type"]);
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
    uploader(req, res, function (err) {
      if (err) {
        if (err instanceof multer.MulterError) {
          res.status(400).send({ "error": err.message });
        } else if (err == "Error: Multipart: Boundary not found") {
          res.status(400).send({ "error": "did not upload file correctly" });
        } else {
          res.status(500).send({ "error": `something went wrong: ${err}` });
        }
        return;
      }
      if (req.file) {
        res.status(200).send({ "data": { "picture": `http://${env.sqlCfg.host}/images/${req.file.filename}` } });
        next();
      } else {
        res.status(400).send({ "error": "did not upload file correctly" });
      }
    })
  }
}
