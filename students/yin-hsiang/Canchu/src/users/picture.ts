import express from 'express';
import multer from 'multer';
import jose from 'jose';
import z from 'zod';

import * as jwt from './jwt.js';
import { User } from '../db/entity/user.js';
import { convertUserPicture } from '../util/util.js';
import { rm } from 'fs/promises';

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

export default async function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction) {
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
  uploader(req, res, async function (err) {
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
      const oldUsr = await User.findOne({
        "select": { "picture": true },
        "where": { "id": payload.id },
        "lock": { "mode": "pessimistic_partial_write" }
      });
      if (oldUsr === null) {
        res.status(403).send({ "error": "invalid token id" });
        return;
      }
      try {
        await User.update({ "id": payload.id }, { "picture": file.filename });
      } catch (err) {
        res.status(500).send({ "error": "internal database error" });
        console.error(`error while updating user picture\n${err}`);
      }
      res.status(200).send({ "data": { "picture": convertUserPicture(file.filename) } });
      console.log(`user with id ${payload.id} changed picture to ${file.filename}`);
      await rm('../../static/avatar/' + oldUsr.picture, {
        "force": true,
        "retryDelay": 300,
        "maxRetries": 3,
        "recursive": true
      });
      console.log(`user with id ${payload.id}'s old picture is removed`);
    }
  })
}
