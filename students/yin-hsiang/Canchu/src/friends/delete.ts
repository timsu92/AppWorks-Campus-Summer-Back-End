import express from 'express';

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
  const friendship_id = +req.params.friendship_id;
  if (isNaN(friendship_id)) {
    res.status(400).send({ "error": "Invalid friendship_id" });
    return;
  }
  const friendship = await Friendship.findOneBy({ "id": friendship_id });
  if (friendship === null) {
    res.status(400).send({ "error": "friendship not found" });
    return;
  }
  if ([friendship.requesterId, friendship.receiverId].includes(req.body.loginUserId)) {
    await friendship.remove();
    if (friendship.status === "friend") {
      console.log(`user ${req.body.loginUserId} revoked friendship between ${friendship.requesterId} and ${friendship.receiverId}`);
    } else if (req.body.loginUserId === friendship.requesterId) {
      console.log(`user ${req.body.loginUserId} cancelled friendship invitation with ${friendship.receiverId}`);
    } else {
      console.log(`user ${req.body.loginUserId} cancelled friendship invitation with ${friendship.requesterId}`);
    }
    return res.status(200).send({
      "data": {
        "friendship": {
          "id": friendship.id,
          "status": friendship.status
        }
      }
    });
  } else {
    res.status(403).send({ "error": "Invalid token id" });
    return;
  }
}
