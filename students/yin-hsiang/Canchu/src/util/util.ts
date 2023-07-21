import express from 'express';

import env from '../../.env.json' assert {type: "json"};

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

export function convertUserPicture (pictureInDB: string): Canchu.UserPicture {
  return `https://${env.sqlCfg.host}/images/${pictureInDB}`;
}
