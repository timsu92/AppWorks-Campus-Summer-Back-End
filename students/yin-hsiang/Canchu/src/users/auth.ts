import express from "express";
import * as jose from 'jose';
import z from 'zod';

import * as jwt from "./jwt.js";
import { User } from "../db/entity/user.js";

export type AccessTokenSuccessBody = {
  "loginUserId": number
}

export type AccessTokenErrorBody = {
  "error": "No token" | "Wrong token format" | "Invalid token" | "Unknown error"
}

export async function accessToken(req: express.Request<{}, AccessTokenErrorBody, AccessTokenSuccessBody>, res: express.Response<AccessTokenErrorBody>, next: express.NextFunction) {
  const access_token = (req.headers["authorization"] ?? "").match(/(?<=^Bearer ).+/)?.[0];
  if (access_token === undefined) {
    res.status(401).send({ "error": "No token" });
    return;
  }

  try {
    const payload = (await jwt.decode(access_token)).payload as { "id": number } & jose.JWTPayload;
    if (!z.number().nonnegative().int().safeParse(payload["id"]).success) {
      res.status(403).send({ "error": "Wrong token format" });
      return;
    }
    req.body.loginUserId = payload.id;
    next();
  } catch (err) {
    if (err instanceof jose.errors.JOSEError) {
      res.status(403).send({ "error": "Invalid token" });
      return;
    } else {
      res.status(500).send({ "error": "Unknown error" });
      console.error("error while decoding access_token:", err);
      return;
    }
  }
}

export async function userExist(
  req: express.Request<{}, AccessTokenErrorBody, AccessTokenSuccessBody>,
  res: express.Response<AccessTokenErrorBody>,
  next: express.NextFunction
) {
  if (typeof req.body.loginUserId !== "number") {
    res.status(401).send({ "error": "No token" });
    return;
  }
  if ((await User.findOneBy({ "id": req.body.loginUserId })) === null) {
    res.status(403).send({ "error": "Invalid token" });
  }
}
