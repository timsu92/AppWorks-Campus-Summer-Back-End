import express from 'express';

export function date2CanchuStr(timestamp: Date) {
  const year = timestamp.getFullYear();
  const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
  const date = timestamp.getDate().toString().padStart(2, '0');
  const hour = (timestamp.getHours()).toString().padStart(2, '0');
  const minute = timestamp.getMinutes().toString().padStart(2, '0');
  const second = timestamp.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}

export function jsonContentType(
  req: express.Request,
  res: express.Response<{ "error": "Invalid content-type" }>,
  next: express.NextFunction
) {
  if (req.headers['content-type'] !== "application/json") {
    res.status(400).send({ "error": "Invalid content-type" });
    return;
  }
  next();
}
