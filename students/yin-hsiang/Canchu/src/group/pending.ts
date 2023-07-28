import express from "express";
import z from 'zod';

import { AccessTokenSuccessBody } from "../users/auth.js";
import { Group, UserGroup } from "../db/entity/group.js";
import { armorUserPicture } from "../util/util.js";

type oSuccess = { "data": Canchu.IGroupPendingObject }
type oError = { "error": string }

export async function groupPendingApplications(
  req: express.Request<{ "group_id": any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const groupId = +req.params.group_id;
  const adminId = req.body.loginUserId;
  if (z.number().nonnegative().int().safeParse(groupId).success === false) {
    return res.status(400).send({ "error": "Invalid group id" });
  }
  const groupMetadata = await Group.findOne({
    "where": {
      "id": groupId,
      "adminId": adminId
    }
  });
  if (groupMetadata === null) {
    return res.status(400).send({ "error": "No suit group found" });
  }
  const pendings = await UserGroup.find({
    "relations": { "user": true },
    "select": {
      "user": {
        "id": true,
        "name": true,
        "picture": true,
      }
    },
    "where": {
      "groupId": groupId,
      "status": "in application",
    },
  });
  return res.status(200).send({
    "data": {
      "users": pendings.map(usrGrp => {
        return {
          "id": usrGrp.userId,
          "name": usrGrp.user!.name,
          "picture": armorUserPicture(usrGrp.user!.picture),
          "status": "pending"
        };
      })
    }
  });
}
