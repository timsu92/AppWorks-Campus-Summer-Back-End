import express from 'express';
import { Equal } from 'typeorm';

import { User } from '../../db/entity/user.js';
import { Friendship } from '../../db/entity/friendship.js';
import { AccessTokenSuccessBody } from '../auth.js';
import { armorUserPicture } from '../../util/util.js';

type oSuccess = {
  "data": {
    "user": Canchu.IUserDetailObject
  }
}

type oError = {
  "error": string
}

export async function getUserProfile(
  req: express.Request<{ "id": any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const targetUserId = +req.params.id;
  if (Number.isNaN(targetUserId)) {
    res.status(400).send({ "error": "invalid id" });
    return;
  }
  const usr = await User.findOne({
    "select": {
      "id": true, "name": true, "picture": true, "introduction": true, "tags": true, "friendCount": true
    },
    "where": { "id": Equal(targetUserId) },
  });
  if (usr === null) {
    res.status(404).send({ "error": "user not found" });
    return;
  }
  const friendship = (await Friendship.findOne({
    "select": { "id": true, "requesterId": true, "receiverId": true, "status": true },
    "where": [
      { "requesterId": Equal(targetUserId), "receiverId": Equal(req.body.loginUserId) },
      { "requesterId": Equal(req.body.loginUserId), "receiverId": Equal(targetUserId) },
    ]
  }));
  console.log(`user ${targetUserId}'s profile was got`);
  return res.status(200).send({
    "data": {
      "user": {
        "id": usr.id,
        "name": usr.name,
        "picture": armorUserPicture(usr.picture),
        "friend_count": usr.friendCount,
        "introduction": usr.introduction,
        "tags": usr.tags,
        "friendship": friendship === null
          ? null
          : {
            "id": friendship.id,
            "status": friendship.status === "friend"
              ? "friend"
              : req.body.loginUserId === friendship.requesterId ? "requested" : "pending"
          }
      }
    }
  });
}
