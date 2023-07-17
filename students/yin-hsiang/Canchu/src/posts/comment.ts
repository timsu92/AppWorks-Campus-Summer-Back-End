import express from 'express';
import { AccessTokenSuccessBody } from '../users/auth.js';
import { Post, PostComment } from '../db/entity/post.js';

type oSuccess = {
  "data": {
    "post": { "id": number },
    "comment": { "id": number }
  }
};

type oError = { "error": string }

export async function createComment(
  req: express.Request<{ id: any }, oSuccess | oError, AccessTokenSuccessBody & { "content": any }>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const postId = +req.params.id;
  if (Number.isNaN(postId)) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }

  const content = req.body.content;
  if (typeof content !== "string") {
    res.status(400).send({ "error": "Invalid comment content" });
    return;
  }
  if (content.length > 500) {
    res.status(400).send({ "error": "New comment's content too long. Maximum is 500" });
    return;
  }

  if (await Post.findOneBy({ "id": postId }) === null) {
    res.status(400).send({ "error": "Post not found" });
    return;
  }

  let comment = new PostComment();
  comment.postId = postId;
  comment.posterId = req.body.loginUserId;
  comment.content = content;
  try {
    comment = await comment.save();
  } catch (err) {
    console.error(`Error when saving new comment:`, err);
    res.status(500).send({ "error": "Internal database error" });
    return;
  }
  console.log(`New comment on post ${comment.postId} by ${comment.posterId}:`,
    comment.content.length > 15 ? `"${comment.content.slice(0, 15)}"...` : comment.content);
  res.status(200).send({
    "data": {
      "post": { "id": postId },
      "comment": { "id": comment.id }
    }
  });
  next();
}
