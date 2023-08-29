import express from 'express';
import { Equal } from 'typeorm';

import { User as DbUser } from '../../db/entity/user.js';
import { User as CacheUser } from '../../db/cache/entity/user.js';
import { Friendship as DbFriendship } from '../../db/entity/friendship.js';
import { Friendship as CacheFriendship } from '../../db/cache/entity/friendship.js';
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

async function _getUserProfileWithoutFriendship(userId: number): Promise<Omit<Canchu.IUserDetailObject, "friendship"> | null> {
  const cache = await CacheUser.getById(userId);
  if (cache !== undefined) {
    console.log(`\tget most of user ${userId}'s profile from cache`);
    return cache;
  }
  const db = await DbUser.findOne({
    "select": {
      "id": true, "name": true, "picture": true, "introduction": true, "tags": true, "friendCount": true
    },
    "where": { "id": Equal(userId) },
  });
  if (db === null)
    return null;
  else {
    console.log(`\tget most of user ${userId}'s profile from db`);

    const mostOfUserProfile = {
      "id": db.id,
      "name": db.name,
      "picture": armorUserPicture(db.picture),
      "introduction": db.introduction,
      "tags": db.tags,
      "friend_count": db.friendCount
    };

    await CacheUser.setById(userId, mostOfUserProfile);
    return mostOfUserProfile;
  }
}

async function _getFriendship(mainUserID: number, targetUserId: number): Promise<Canchu.IFriendshipObject | null> {
  const cache = await CacheFriendship.getByUserIds([mainUserID, targetUserId]);
  if(cache !== undefined){
    console.log(`\tget friendship of ${mainUserID} and ${targetUserId} from cache`);
    return cache;
  }
  const db = await DbFriendship.findOne({
    "select": { "id": true, "requesterId": true, "receiverId": true, "status": true },
    "where": [
      { "requesterId": Equal(mainUserID), "receiverId": Equal(targetUserId) },
      { "requesterId": Equal(targetUserId), "receiverId": Equal(mainUserID) },
    ]
  });
  console.log(`\tget friendship of ${mainUserID} and ${targetUserId} from db`);

  const friendship: Canchu.IFriendshipObject | null = db === null
    ? null
    : {
      "id": db.id,
      "status": db.status === "friend"
        ? "friend"
        : mainUserID === db.requesterId
          ? "requested"
          : "pending"
    };

  await CacheFriendship.setByUserIds([mainUserID, targetUserId], friendship);
  return friendship;
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
  const usr = await _getUserProfileWithoutFriendship(targetUserId);
  if (usr === null) {
    res.status(404).send({ "error": "user not found" });
    return;
  }
  const friendship = await _getFriendship(req.body.loginUserId, targetUserId);
  console.log(`user ${targetUserId}'s profile was got`);
  return res.status(200).send({
    "data": {
      "user": {
        ...usr,
        "friendship": friendship
      }
    }
  });
}
