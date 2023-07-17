import express from 'express';
import { AccessTokenSuccessBody } from '../users/auth.js';
import { Post } from '../db/entity/post.js';

type oSuccess = { "data": { "post": Canchu.IPostObject } }
type oError = { "error": string }

export default async function (
  req: express.Request<{ "id": any }, oSuccess | oError, AccessTokenSuccessBody & { "context": any }>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  if (Number.isNaN(+req.params.id)) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }
  if (typeof req.body.context !== "string") {
    res.status(400).send({ "error": "Invalid post context" });
    return;
  }
  if (req.body.context.length > 1000) {
    res.status(400).send({ "error": "Post context too long. Maximum is 1000" });
    return;
  }
  const post = await Post.findOneBy({ "id": req.params.id });
  if (post === null) {
    res.status(400).send({ "error": "Post not found" });
    return;
  }
  if (post.posterId !== req.body.loginUserId) {
    res.status(403).send({ "error": "Permission denied" });
    return;
  }
  post.context = req.body.context;
  try {
    await post.save();
  } catch (err) {
    console.error("Error when saving modified post:", err);
    res.status(500).send({ "error": "Internal database error" });
    return;
  }
  console.log(`Post ${post.id}'s context changed to`,
    post.context.length > 15 ? post.context.slice(0, 15) + '...' : post.context);
  res.status(200).send({ "data": { "post": { "id": post.id } } });
  next();
}
