import express from 'express';

import { Friendship } from '../db/entity/friendship.js';
import { AccessTokenSuccessBody } from '../users/auth.js';
import { convertUserPicture } from '../util/util.js';

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
  const receiverId = req.body.loginUserId;
  const friendships = await Friendship.find({"where": {receiverId, "status": "requested"}, "relations": ["requester"]});
  res.status(200).send({
    "data": {
      "users": friendships.map(relation => {
        return {
          "id": relation.requester!.id,
          "name": relation.requester!.name,
          "picture": convertUserPicture(relation.requester!.picture),
          "friendship": {
            "id": relation.id,
            "status": "pending"
          }
        }
      })
    }
  });
  console.log(`user ${receiverId} listed pending friends`);
  next();
}
