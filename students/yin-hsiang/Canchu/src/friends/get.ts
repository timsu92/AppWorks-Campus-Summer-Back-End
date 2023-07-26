import express from 'express';

import { AccessTokenSuccessBody } from '../users/auth.js';
import { Friendship } from '../db/entity/friendship.js';
import { armorUserPicture } from '../util/util.js';

type oSuccess = {
  "data": {
    "users": Canchu.IUserSearchObject[]
  }
}

type oError = {
  "error": string
}

export default async function (
  req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  // get requester who is a friend or receiver who is a friend, not both requester and receiver and friend
  const friends = await Friendship.find({
    "where": [
      {"requesterId": req.body.loginUserId, "status": "friend"},
      {"receiverId": req.body.loginUserId, "status": "friend"}
    ],
    "relations": ["requester", "receiver"]
  });
  res.status(200).send({
    "data": {
      "users": friends.map(friendship => {
        const opponentUser = friendship.requester!.id === req.body.loginUserId ? friendship.receiver! : friendship.requester!;
        return {
          "id": opponentUser.id,
          "name": opponentUser.name,
          "picture": armorUserPicture(opponentUser.picture),
          "friendship": {
            "id": friendship.id,
            "status": friendship.status
          }
        };
      })
    }
  });
  console.log(`user ${req.body.loginUserId} viewed friends`);
  next();
}
