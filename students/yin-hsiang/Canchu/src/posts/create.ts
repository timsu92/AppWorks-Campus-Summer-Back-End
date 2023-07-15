import express from 'express';

import { AccessTokenSuccessBody } from '../users/auth.js';
import { Post } from '../db/entity/post.js';

type oSuccess = { "data": { "post": { "id": number } } };
type oError = { "error": string };

export default async function (
  req: express.Request<{}, oSuccess | oError, { "context": any } & AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  if (typeof req.body.context !== "string") {
    res.status(400).send({ "error": "Invalid context or content of the post." });
    return;
  }
  if (req.body.context.length > 1000) {
    res.status(400).send({ "error": "Context or content of the post too long. Maximum is 1000." });
    return;
  }
  let post = new Post();
  post.posterId = req.body.loginUserId;
  post.context = req.body.context;
  try {
    post = await post.save();
  } catch (err) {
    console.error("Error when saving new post:", err);
    res.status(500).send({ "error": "Internal database error" });
    return;
  }
  console.log(`user ${req.body.loginUserId} created new post ${post.id}`);
  res.status(200).send({ "data": { "post": { "id": post.id } } });
  next();
}
