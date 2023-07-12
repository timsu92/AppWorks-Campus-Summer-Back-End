import express from 'express';
import multer from 'multer';
import jose from 'jose';
import z from 'zod';

import env from '../../.env.json' assert {type: "json"};
import * as jwt from './jwt.js';
import { DataSource } from 'typeorm';
import { User } from '../db/entity/user.js';

export default function (db: DataSource) {
  type oSuccess = {
    "data": {
      "picture": string
    }
  }

  type oError = {
    "error": string
  }

  // get image from field "picture" of body and save them to static/avatar folder
  const uploader = multer({ dest: 'static/avatar' }).single('picture');

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
      if (!req.file) {
        res.status(400).send({ "error": "did not upload file correctly" });
      } else {
        const file = req.file;
        db.getRepository(User).update({ "id": payload.id }, { "picture": `images/${file.filename}` })
          .then((updateResult) => {
            if (updateResult.affected === 1) {
              res.status(200).send({ "data": { "picture": `http://${env.sqlCfg.host}/images/${file.filename}` } });
              console.log(`user with id ${payload.id} changed picture to /images/${file.filename}`);
              next();
            } else {
              res.status(403).send({ "error": "invalid token id" });
            }
          })
          .catch((err) => {
            res.status(500).send({ "error": "internal database error" });
            console.error(`error while updating user picture\n${err}`);
          })
      }
    })
  }
}
