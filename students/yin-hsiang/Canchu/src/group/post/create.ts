import express from "express";
import z from 'zod';

import { AccessTokenSuccessBody } from "../../users/auth.js";
import { GroupPost, UserGroup } from "../../db/entity/group.js";

type oSuccess = {
  "data": {
    "group": { "id": number },
    "user": { "id": number },
    "post": { "id": number }
  }
}

type oError = { "error": string }

export async function createGroupPost(
  req: express.Request<{ group_id: any }, oSuccess | oError, AccessTokenSuccessBody & { "context": any }>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
): Promise<express.Response<oSuccess | oError>> {
  const groupId = +req.params.group_id;
  const userId = req.body.loginUserId;
  const context = req.body.context;

  if (z.number().nonnegative().int().safeParse(groupId).success === false) {
    return res.status(400).send({ "error": "Invalid group id" });
  }
  if (typeof context !== "string") {
    return res.status(400).send({ "error": "Invalid post context" });
  }

  const user = await UserGroup.findOne({
    "select": { "id": true },
    "where": {
      "groupId": groupId,
      "userId": userId,
      "status": "member",
    }
  });
  if (user === null) {
    return res.status(400).send({ "error": "You can't post here" });
  }

  let post = new GroupPost();
  post.context = context;
  post.posterId = userId;
  post.groupId = groupId;
  try {
    post = await post.save();
  } catch (err) {
    console.error(`Error when creating post in group ${groupId} by user ${userId}:`, err);
    return res.status(500).send({ "error": "Internal database error" });
  }
  console.log(
    `user ${userId} posted`,
    context.length > 10 ? `"${context.slice(0,7)}..."` : `"${context}"`,
    `in group ${groupId}`
  );
  return res.status(200).send({
    "data": {
      "group": { "id": groupId },
      "user": { "id": userId },
      "post": { "id": post.id }
    }
  });
}
