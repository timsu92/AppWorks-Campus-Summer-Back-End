import express from "express";
import z from "zod";

import { Group, UserGroup } from "../db/entity/group.js";
import { AccessTokenSuccessBody } from "../users/auth.js";
import { Equal } from "typeorm";

type oSuccess = { "data": Canchu.IGroupObject }
type oError = { "error": string }

export async function deleteGroup(
  req: express.Request<{ group_id: any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const groupId = +req.params.group_id;
  if (z.number().nonnegative().int().safeParse(groupId).success === false) {
    return res.status(400).send({ "error": "Invalid group id" });
  }
  return await Group.getRepository().manager.transaction(async mgr => {
    const isCertificateToDelete = await mgr.exists(Group, {
      "where": {
        "id": groupId,
        "adminId": req.body.loginUserId
      },
      "lock": { "mode": "pessimistic_partial_write" }
    });
    if (!isCertificateToDelete) {
      return res.status(400).send({ "error": "No suit group found" });
    }

    try {
      await mgr.delete(UserGroup, {
        "groupId": Equal(groupId)
      });
    } catch (err) {
      console.log(`Error when deleting members in group ${groupId}:`, err);
      res.status(500).send({ "error": "Internal database error" });
      throw err;
    }

    try {
      await mgr.delete(Group, {
        "id": groupId,
        "adminId": req.body.loginUserId
      });
    } catch (err) {
      console.log(`Error when trying to delete group ${groupId} whose admin claims to be ${req.body.loginUserId}:`, err)
      res.status(500).send({ "error": "Internal database error" });
      throw err;
    }

    console.log(`User ${req.body.loginUserId} deleted group ${groupId}`);
    return res.status(200).send({ "data": { "group": { "id": groupId } } });
  })
}
