import express from 'express';

import { User } from '../db/entity/user.js';
import { Friendship } from '../db/entity/friendship.js';
import { AccessTokenSuccessBody } from '../users/auth.js';

type oSuccess = {
  "data": {
    "friendship": Canchu.IFriendshipObject
  }
}

type oError = {
  "error": string
}

export default async function (
  req: express.Request<{ "friendship_id": any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  if (!Number.isInteger(+req.params.friendship_id)) {
    res.status(400).send({ "error": "invalid friendship_id" });
    return;
  }
  const requesterId = +req.params.friendship_id;
  const receiverId = req.body.loginUserId;

  if (requesterId === receiverId) {
    res.status(400).send({ "error": "can't make friend with self" });
    return;
  }

  const requester = await User.findOneBy({ "id": requesterId });
  if (requester === null) {
    res.status(403).send({ "error": "user not found" });
    return;
  }
  const receiver = await User.findOneBy({ "id": receiverId });
  if (receiver === null) {
    res.status(400).send({ "error": "invalid token" });
    return;
  }

  let friendship = await Friendship.findOneBy({ "requesterId": requesterId, "receiverId": receiverId });
  if (friendship === null) {
    res.status(400).send({ "error": "friendship request not performed" });
    return;
  }
  friendship.status = "friend";
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
    console.log(`${requesterId} and ${receiverId} have become friends`);
    next();
  } catch (err) {
    res.status(500).send({ "error": "internal database error" });
    console.error("error while updating friendship:", err);
    return;
  }
}
