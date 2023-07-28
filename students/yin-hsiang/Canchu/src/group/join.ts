import express from "express";
import z from 'zod';

import { Group, UserGroup } from "../db/entity/group.js";
import { AccessTokenSuccessBody } from "../users/auth.js";

type oSuccess = Canchu.IGroupObject
type oError = { "error": string }

export async function joinGroup(
  req: express.Request<{ "group_id": any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const groupId = +req.params.group_id;
  if (z.number().nonnegative().int().safeParse(groupId).success === false) {
    return res.status(400).send({ "error": "Invalid group id" });
  }
  if ((await Group.findOneBy({ "id": groupId })) === null) {
    return res.status(400).send({ "error": "Group not found" });
  }
  const membership = await UserGroup.findOneBy({
    "groupId": groupId,
    "userId": req.body.loginUserId
  });
  if (membership !== null) {
    return res.status(400).send({ "error": `You are ${membership.status} of it` });
  }
  try {
    const membership = new UserGroup();
    membership.groupId = groupId;
    membership.userId = req.body.loginUserId;
    membership.status = "in application";
    await membership.save();
  } catch (err) {
    console.error(`Error when saving group application for user ${req.body.loginUserId} to group ${groupId}:`, err);
    return res.status(500).send({ "error": "Internal database error" });
  }
  console.log(`user ${req.body.loginUserId} applied for group ${groupId}`);
  return res.status(200).send({ "data": { "group": { "id": groupId } } });
}
