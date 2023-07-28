import express from "express";

import { AccessTokenSuccessBody } from "../users/auth.js";
import { Group, UserGroup } from "../db/entity/group.js";

type oSuccess = { "data": { "group": { "id": number } } }
type oError = { "error": string }

export async function createGroup(
  req: express.Request<any, oSuccess | oError, AccessTokenSuccessBody & { "name": any }>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  if (typeof req.body.name !== "string") {
    return res.status(400).send({ "error": "Invalid group name" });
  }
  const groupName = req.body.name;
  const adminId = req.body.loginUserId;

  await UserGroup.getRepository().manager.transaction(async mgr => {
    let group = new Group();
    group.adminId = adminId;
    group.name = groupName;
    try {
      group = await group.save();
    } catch (err) {
      console.error(`Error while creating new group:`, err);
      await mgr.queryRunner?.rollbackTransaction();
      return res.status(500).send({ "error": "Internal server error" });
    }

    let relation = new UserGroup();
    relation.groupId = group.id;
    relation.userId = adminId;
    relation.status = "member";
    try {
      relation = await relation.save();
    } catch (err) {
      console.log(`Error while creating relation between group ${group.id} and user ${adminId}:`, err);
      await mgr.queryRunner?.rollbackTransaction();
      return res.status(500).send({ "error": "Internal server error" });
    }

    return res.status(200).send({ "data": { "group": { "id": group.id } } });
  })
}
