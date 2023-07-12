import express from 'express';
import * as jose from 'jose';
import z from 'zod';

import * as jwt from '../users/jwt.js';
import { User } from '../db/entity/user.js';
import { Friendship } from '../db/entity/friendship.js';

type oSuccess = {
  "data": {
    "friendship": Canchu.IFriendshipObject
  }
}

type oError = {
  "error": string
}

export default async function (req: express.Request, res: express.Response<oSuccess | oError>, next: express.NextFunction) {
  if (!Number.isInteger(+req.params.user_id)) {
    res.status(400).send({ "error": "invalid user_id" });
    return;
  }
  const receiverId = +req.params.user_id;
  const access_token = (req.headers["authorization"] ?? "").match(/(?<=^Bearer ).+/)?.[0];
  if (access_token === undefined) {
    res.status(401).send({ "error": "no token" });
    return;
  }

  let requesterId = 0;
  try {
    const payload = (await jwt.decode(access_token)).payload as { "id": number } & jose.JWTPayload;
    if (!z.number().nonnegative().int().safeParse(payload["id"]).success) {
      res.status(403).send({ "error": "Wrong token format" });
      return;
    }
    requesterId = payload.id;
  } catch (err) {
    if (err instanceof jose.errors.JOSEError) {
      res.status(403).send({ "error": "invalid token" });
      return;
    } else {
      res.status(500).send({ "error": "unknown error" });
      console.error("error while decoding access_token:", err);
    }
  }

  if (requesterId === receiverId) {
    res.status(400).send({ "error": "can't make friend with self" });
    return;
  }

  const requester = await User.findOneBy({ "id": requesterId });
  if (requester === null) {
    res.status(403).send({ "error": "invalid token" });
    return;
  }
  const receiver = await User.findOneBy({ "id": receiverId });
  if (receiver === null) {
    res.status(400).send({ "error": "user not found" });
    return;
  }

  let friendship = await Friendship.findOneBy({ "requesterId": requesterId, "receiverId": receiverId });
  if (friendship) {
    if (friendship.status === "requested") {
      res.status(400).send({ "error": "already requested" });
      return;
    } else {
      res.status(400).send({ "error": "already friend" });
      return;
    }
  }
  friendship = new Friendship();
  friendship.requester = requester;
  friendship.receiver = receiver;
  friendship.status = "requested";
  try {
    friendship = await friendship.save();
    res.status(200).send({
      "data": {
        "friendship": {
          "id": friendship.id,
          "status": friendship.status
        }
      }
    });
    console.log(requesterId, "requests to make friend with", receiverId);
    next();
  } catch (err) {
    res.status(500).send({ "error": "internal database error" });
    console.error("error while creating friendship:", err);
    return;
  }
}
