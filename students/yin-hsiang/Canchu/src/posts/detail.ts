import express from 'express';

import { AccessTokenSuccessBody } from '../users/auth.js';
import { Post } from '../db/entity/post.js';
import { date2CanchuStr } from '../util/util.js';

type oSuccess = { "data": { "post": Canchu.IPostDetailObject } }
type oError = { "error": string }

export async function getPostDetail(
  req: express.Request<{ id: any }, oSuccess | oError, AccessTokenSuccessBody>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const postId = +req.params.id;
  if (Number.isNaN(postId)) {
    res.status(400).send({ "error": "Invalid post id" });
    return;
  }
  const post = await Post.findOne({
    "where": { "id": postId },
    "relations": {
      "comments": {
        "poster": true,
      },
      "likers": true,
      "poster": true,
    },
    "select": {
      "id": true, "createdAt": true, "context": true, "summary": true,
      "poster": {
        "name": true,
        "picture": true
      },
      "comments": {
        "id": true, "createdAt": true, "content": true,
        "poster": {
          "id": true,
          "name": true,
          "picture": true
        }
      },
      "likers": {
        "likerId": true
      }
    }
  });
  if (post === null) {
    res.status(400).send({ "error": "Post not found" });
    return;
  }
  res.status(200).send({
    "data": {
      "post": {
        "id": post.id,
        "created_at": date2CanchuStr(post.createdAt),
        "context": post.context,
        "summary": post.summary ?? "", // nowhere found its usage yet
        "is_liked": post.likers!.some(postLike => postLike.likerId === req.body.loginUserId),
        "like_count": post.likers!.length,
        "comment_count": post.comments!.length,
        "picture": post.poster!.picture,
        "name": post.poster!.name,
        "comments": post.comments!.map(cmt => {
          return {
            "id": cmt.id,
            "created_at": date2CanchuStr(cmt.createdAt),
            "content": cmt.content,
            "user": {
              "id": cmt.poster!.id,
              "name": cmt.poster!.name,
              "picture": cmt.poster!.picture
            }
          };
        })
      }
    }
  });
  next();
}
