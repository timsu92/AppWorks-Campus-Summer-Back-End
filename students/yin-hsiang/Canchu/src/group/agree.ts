import express from "express";
import z from 'zod';

import { AccessTokenSuccessBody } from "../users/auth.js";
import { Group, UserGroup } from "../db/entity/group.js";

type oSuccess = { "data": { "user": { "id": number } } }
type oError = { "error": string }

export async function groupAgreeApplication(
  req: express.Request<{ group_id: any, user_id: any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const groupId = +req.params.group_id;
  const userId = +req.params.user_id;
  const adminId = req.body.loginUserId;

  if (z.number().nonnegative().int().safeParse(groupId).success === false) {
    return res.status(400).send({ "error": "Invalid group id" });
  }
  if (z.number().nonnegative().int().safeParse(userId).success === false) {
    return res.status(400).send({ "error": "Invalid user id" });
  }
  try {
    return await Group.getRepository().manager.transaction(async mgr => {
      const groupMetadata = await mgr.findOne(Group, {
        "where": {
          "id": groupId,
          "adminId": adminId,
        },
        "lock": { "mode": "pessimistic_read" }
      });
      if (groupMetadata === null) {
        return res.status(400).send({ "error": "No suit group found" });
      }
      const applicant = await mgr.findOne(UserGroup, {
        "where": {
          "groupId": groupId,
          "userId": userId,
          "status": "in application",
        },
        "lock": { "mode": "pessimistic_partial_write" }
      });
      if (applicant === null) {
        return res.status(400).send({ "error": "No such user" });
      }
      try {
        await mgr.update(UserGroup, {
          "groupId": groupId,
          "userId": userId,
          "status": "in application",
        }, {
          "status": "member",
        })
      } catch (err) {
        console.log(`Error when allowing user ${userId} to apply for group ${groupId}:`, err);
        res.status(500).send({ "error": "Internal database error" });
        throw err;
      }
      return res.status(200).send({ "data": { "user": { "id": userId } } });
    })
  } catch (e) { }
}
