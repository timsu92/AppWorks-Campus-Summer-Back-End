import express from 'express';

import { Friendship } from '../db/entity/friendship.js';
import { AccessTokenSuccessBody } from '../users/auth.js';
import { Event_ } from '../db/entity/event.js';

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
  const friendshipId = +req.params.friendship_id;
  const receiverId = req.body.loginUserId;

  const friendship = await Friendship.getRepository().manager.transaction(async mgr => {
    const friendship = await mgr.findOneBy(Friendship, { "id": friendshipId });
    if (friendship === null) {
      res.status(400).send({ "error": "friendship request not performed" });
      return;
    }
    if (receiverId !== friendship.receiverId) {
      res.status(400).send({ "error": "Permission denied" });
      return;
    }
    if (friendship.status === "friend") {
      res.status(400).send({ "error": "already friends" });
      return;
    }
    friendship.status = "friend";
    try {
      return await mgr.save(friendship);
    } catch (err) {
      res.status(500).send({ "error": "internal database error" });
      console.error("error while updating friendship:", err);
      return;
    }
  });
  if (friendship === undefined)
    return;

  const notification = new Event_();
  notification.type = "friend_request";
  notification.ownerId = friendship.requesterId;
  notification.participantId = friendship.receiverId;
  notification.friendshipId = friendship.id;
  try {
    await notification.save();
  } catch (err) {
    console.error("Error when saving notification when friendship agreed:", err);
  }

  res.status(200).send({
    "data": {
      "friendship": {
        "id": friendship.id,
        "status": friendship.status
      }
    }
  });
  console.log(`${friendship.requesterId} and ${receiverId} have become friends`);
  next();
}
