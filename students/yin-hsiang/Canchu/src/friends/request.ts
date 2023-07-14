import express from 'express';

import { User } from '../db/entity/user.js';
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

export default async function (req: express.Request<{ "user_id": any }, oSuccess | oError, AccessTokenSuccessBody>, res: express.Response<oSuccess | oError>, next: express.NextFunction) {
  if (!Number.isInteger(+req.params.user_id)) {
    res.status(400).send({ "error": "invalid user_id" });
    return;
  }
  const receiverId = +req.params.user_id;
  const requesterId = req.body.loginUserId;

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
  } catch (err) {
    res.status(500).send({ "error": "internal database error" });
    console.error("error while creating friendship:", err);
    return;
  }

  const notification = new Event_();
  notification.type = "friend_request";
  notification.ownerId = receiver.id;
  notification.participantId = requesterId;
  notification.friendshipId = friendship.id;
  try {
    await notification.save();
  } catch (err) {
    res.status(500).send({ "error": "Internal database error" });
    console.error(`Error when saving notification when friendship requested:`, err);
    return;
  }

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
}
