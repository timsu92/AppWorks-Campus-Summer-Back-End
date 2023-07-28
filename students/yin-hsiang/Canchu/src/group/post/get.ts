import express from "express";
import z from "zod";

import { AccessTokenSuccessBody } from "../../users/auth.js";
import { GroupPost, UserGroup } from "../../db/entity/group.js";
import { date2CanchuStr, armorUserPicture } from "../../util/util.js";

type oSuccess = { "data": { "posts": Canchu.IGroupPostDetailObject[] } }
type oError = { "error": string }

export async function listAllGroupPosts(
  req: express.Request<{ group_id: any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
): Promise<express.Response<oSuccess | oError>> {
  const groupId = +req.params.group_id;
  if (z.number().nonnegative().int().safeParse(groupId).success === false) {
    return res.status(400).send({ "error": "Invalid group id" });
  }
  const membership = await UserGroup.findOne({
    "where": {
      "groupId": groupId,
      "userId": req.body.loginUserId,
      "status": "member"
    }
  });
  if (membership === null) {
    return res.status(400).send({ "error": "Permission denied" });
  }
  const posts = await GroupPost.find({
    "relations": { "poster": true },
    "where": { "groupId": groupId },
    "order": { "createdAt": "DESC" },
  });
  return res.status(200).send({
    "data": {
      "posts": posts.map(groupPost => {
        return {
          "id": groupPost.id,
          "user_id": groupPost.posterId,
          "created_at": date2CanchuStr(groupPost.createdAt),
          "context": groupPost.context,
          "is_liked": false,
          "like_count": 0,
          "comment_count": 0,
          "picture": armorUserPicture(groupPost.poster!.picture),
          "name": groupPost.poster!.name
        };
      })
    }
  });
}
