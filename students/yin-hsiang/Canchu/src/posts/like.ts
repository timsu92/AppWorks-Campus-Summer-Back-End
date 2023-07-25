import express from 'express';
import { AccessTokenSuccessBody } from '../users/auth.js';
import { Post, PostLikes } from '../db/entity/post.js';

type oSuccess = { "data": { "post": Canchu.IPostObject } }
type oError = { "error": string }

export async function createLike(
  req: express.Request<{ id: any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const postId = +req.params.id;
  const userId = req.body.loginUserId;
  if (Number.isNaN(postId)) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }
  const post = await Post.findOneBy({ "id": postId });
  if (post === null) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }
  let like = await PostLikes.findOneBy({ "likerId": userId, postId });
  if (like !== null) {
    res.status(400).send({ "error": "Already liked" });
    return;
  }
  like = new PostLikes();
  like.likerId = userId;
  like.postId = postId;
  try {
    await like.save();
  } catch (err) {
    console.error(`Error saving like to post ${postId} by user ${userId}`);
    res.status(500).send({ "error": "Internal database error" });
    return;
  }
  console.log(`user ${userId} liked post ${postId}`);
  res.status(200).send({ "data": { "post": { "id": postId } } });
  next();
}

export async function unlike(
  req: express.Request<{ id: any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const postId = +req.params.id;
  const userId = req.body.loginUserId;
  if (Number.isNaN(postId)) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }
  const post = await Post.findOneBy({ "id": postId });
  if (post === null) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }
  let like = await PostLikes.findOneBy({ "likerId": userId, postId });
  if (like === null) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }
  if (like.likerId !== userId) {
    res.status(403).send({ "error": "Permission denied" });
    return;
  }
  try {
    await like.remove();
  } catch (err) {
    console.error(`Error deleting like to post ${postId} by user ${userId}`);
    res.status(500).send({ "error": "Internal database error" });
    return;
  }
  console.log(`user ${userId} revoked like on post ${postId}`);
  res.status(200).send({ "data": { "post": { "id": postId } } });
  next();
}
