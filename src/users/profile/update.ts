import express from 'express';
import z from "zod";

import { AccessTokenSuccessBody } from '../auth.js';
import { User as DbUser } from '../../db/entity/user.js';
import { User as CacheUser } from '../../db/cache/entity/user.js';

const iBodyZ = z.object({
  "name": z.string().nonempty(),
  "introduction": z.string(),
  "tags": z.string()
})

type iBody = {
  "name": any, // string
  "introduction": any, // string
  "tags": any, // string
}

type oSuccess = {
  "data": {
    "user": {
      "id": number
    }
  }
}

type oError = {
  "error": string
}

export async function updateUserProfile(
  req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody & iBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const body = iBodyZ.safeParse(req.body);
  if (!body.success) {
    return res.status(400).send({ "error": body.error.message });
  }
  const userId = req.body.loginUserId;
  try {
    const updateResult = await DbUser.update({ "id": userId }, {
      "name": body.data.name,
      "introduction": body.data.introduction,
      "tags": body.data.tags
    });

    if (updateResult.affected === 0)
      return res.status(403).send({ "error": "Wrong token" });
    console.log(`user with id ${userId} changed profile to`, body.data);
    await CacheUser.delById(userId);
    return res.status(200).send({ "data": { "user": { "id": userId } } });
  } catch (err) {
    res.status(500).send({ "error": "internal database error" });
    console.error(`error while executing 'UPDATE user SET name=${body.data.name}, introduction=${body.data.introduction}, tags=${body.data.tags} WHERE id=${userId}'\n`, err);
  }
}
