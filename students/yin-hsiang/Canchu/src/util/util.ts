import express from 'express';

import env from '../../.env.json' assert {type: "json"};
import { newRedis } from '../db/cache/lib.js';

const jetlagMillisecond = 1000 * 60 * (new Date().getTimezoneOffset() * -1);

export function date2CanchuStr(timestamp: Date) {
  const localTime = new Date(timestamp.valueOf() + jetlagMillisecond);
  const year = localTime.getFullYear();
  const month = (localTime.getMonth() + 1).toString().padStart(2, '0');
  const date = localTime.getDate().toString().padStart(2, '0');
  const hour = (localTime.getHours() + 8).toString().padStart(2, '0'); // workaround for EC2 not in UTC+8
  const minute = localTime.getMinutes().toString().padStart(2, '0');
  const second = localTime.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}

export function jsonContentType(
  req: express.Request<{}>,
  res: express.Response<{ "error": "Invalid content-type" }>,
  next: express.NextFunction
) {
  if (req.headers['content-type'] !== "application/json") {
    res.status(400).send({ "error": "Invalid content-type" });
    return;
  }
  next();
}

export function armorUserPicture(pictureInDB: string): Canchu.UserPicture {
  if (pictureInDB.length > 0)
    return `https://${env.cacheAddr as `${number}.${number}.${number}.${number}`}/images/${pictureInDB}`;
  else
    return "";
}

export async function rateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const NORMAL_DURATION = 1;
  const NORMAL_COUNT = 10;
  const BLOCK_DURATION = 30;

  const redis = newRedis();
  const isNewUser = await redis.set(`operateCount:${req.ip}`, 1, "EX", NORMAL_DURATION, "NX");
  if (isNewUser) {
    await redis.quit();
    return next();
  }
  const count = await redis.incr(`operateCount:${req.ip}`);
  if (count > NORMAL_COUNT) {
    // return 1 on success and 0 on fail
    const setExpireSuccessful = await redis.expire(`operateCount:${req.ip}`, BLOCK_DURATION);
    if (!setExpireSuccessful) {
      await redis.set(`operateCount:${req.ip}`, NORMAL_COUNT + 1, "EX", BLOCK_DURATION, "NX");
    }
    await redis.quit();
    return res.status(429).appendHeader("Retry-After", "30").send({ "error": "Too Many Requests" });
  } else {
    await redis.quit();
    return next();
  }
}
