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
  const friendship = await Friendship.getRepository().manager.transaction(
    "REPEATABLE READ",
    async mgr => {
      const friendship = await mgr.findOneBy(Friendship, { "id": friendship_id });
      if (friendship === null) {
        res.status(400).send({ "error": "friendship not found" });
        return;
      }
      if ([friendship.requesterId, friendship.receiverId].includes(req.body.loginUserId)) {
        try {
          await mgr.remove(friendship);
        } catch (err) {
          console.log(`error removing friendship ${friendship_id}:`, err);
          res.status(500).send({ "error": "Internal database error" });
          return;
        }
        if (friendship.status === "requested") {
          if (req.body.loginUserId === friendship.requesterId)
            console.log(`user ${req.body.loginUserId} cancelled friendship invitation with ${friendship.receiverId}`);
          else
            console.log(`user ${req.body.loginUserId} cancelled friendship invitation with ${friendship.requesterId}`);
        } else {
          console.log(`user ${req.body.loginUserId} revoked friendship between ${friendship.requesterId} and ${friendship.receiverId}`);
        }
        return friendship;
      } else {
        res.status(403).send({ "error": "Invalid token id" });
        return;
      }
    }
  );

  if (friendship === undefined) {
    return;
  }

  return res.status(200).send({
    "data": {
      "friendship": {
        "id": friendship.id,
        "status": friendship.status
      }
    }
  });
}
