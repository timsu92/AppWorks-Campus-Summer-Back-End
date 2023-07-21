import express from 'express';
import { AccessTokenSuccessBody } from '../users/auth.js';
import { Event_ } from '../db/entity/event.js';
import { convertUserPicture, date2CanchuStr } from '../util/util.js';

type oSuccess = { "data": { "events": Canchu.IEventObject[] } }

type oError = { "error": string }

export default async function (
  req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const events = await Event_.find({
    "where": {
      "ownerId": req.body.loginUserId
    },
    "relations": ["participant", "friendship"]
  });
  console.log(`user ${req.body.loginUserId} viewed events`);
  res.status(200).send({
    "data": {
      "events": events.map(ev => {
        return {
          "id": ev.id,
          "type": ev.type,
          "is_read": ev.isRead,
          "image": convertUserPicture(ev.participant!.picture),
          "created_at": date2CanchuStr(ev.createdAt),
          "summary": ev.summary()
        }
      })
    }
  });
  next();
}
