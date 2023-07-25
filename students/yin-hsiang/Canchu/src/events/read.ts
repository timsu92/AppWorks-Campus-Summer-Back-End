import express from 'express';
import { AccessTokenSuccessBody } from '../users/auth.js';
import { Event_ } from '../db/entity/event.js';
import { convertUserPicture, date2CanchuStr } from '../util/util.js';

type oSuccess = { "data": { "event": Canchu.IEventObject } }
type oError = { "error": string }

export default async function (
  req: express.Request<{ "event_id": any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  if (isNaN(+req.params.event_id)) {
    res.status(400).send({ "error": "Invalid event id" });
    return;
  }
  let event = await Event_.findOne({
    "where": { "id": +req.params.event_id },
    "relations": ['participant', 'friendship']
  })
  if (event === null) {
    res.status(400).send({ "error": "Invalid event id" });
    return;
  }
  if (event.ownerId !== req.body.loginUserId) {
    res.status(403).send({ "error": "can't read this event" });
    return;
  }
  if (event.isRead) {
    res.status(400).send({ "error": "already read event" });
    return;
  }
  event.isRead = true;
  try {
    event = await event.save();
  } catch (err) {
    res.status(500).send({"error": "Internal database error"});
    return;
  }
  res.status(200).send({
    "data": {
      "event": {
        "id": event.id,
        "type": event.type,
        "image": convertUserPicture(event.participant!.picture),
        "summary": event.summary(),
        "is_read": event.isRead,
        "created_at": date2CanchuStr(event.createdAt)
      }
    }
  });
  console.log(`user ${req.body.loginUserId} read event ${event.id}`);
  next();
}
