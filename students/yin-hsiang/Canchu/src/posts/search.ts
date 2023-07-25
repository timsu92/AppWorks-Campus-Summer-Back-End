import express from 'express';
import z from 'zod';
import { base64url } from 'jose';
import { LessThanOrEqual } from 'typeorm';

import { Post } from '../db/entity/post.js';
import { Friendship } from '../db/entity/friendship.js';

import { AccessTokenSuccessBody } from '../users/auth.js';
import { convertUserPicture, date2CanchuStr } from '../util/util.js';

class PaginationCursor {
  private _newestPostId: number;

  constructor(newestPostId: number) {
    this._newestPostId = newestPostId;
  }

  public static fromSerialized(serializedJson: string): PaginationCursor {
    const decoded = JSON.parse(base64url.decode(serializedJson).toString());
    return new PaginationCursor(decoded._newestPostId);
  }

  public get newestPostId() { return this._newestPostId; }
  public get serialized() { return base64url.encode(JSON.stringify(this)); }
}

type oSuccess = {
  "data": {
    "posts": Canchu.IPostSearchObject[],
    "next_cursor": string | null
  }
}

type oError = { "error": string }

export async function genCursor(
  req: express.Request<{}, oError, AccessTokenSuccessBody & { "cursor": PaginationCursor } & Record<any, any>, { "cursor"?: any } & Record<any, any>>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  switch (typeof req.query.cursor) {
    case "string":
      try {
        req.body.cursor = PaginationCursor.fromSerialized(req.query.cursor);
      } catch (e) {
        res.status(400).send({ "error": "Invalid cursor. Can't transform" });
        return;
      }
      next();
      break;
    case "undefined": // req.params.cursor
      req.body.cursor = new PaginationCursor(Number.MAX_SAFE_INTEGER);
      next();
      break;
    default: // req.params.cursor
      res.status(400).send({ "error": "Invalid type of cursor" });
      return;
  }
}

export async function listTargetUserId(
  req: express.Request<{}, oError, AccessTokenSuccessBody & { "targetUserId": number[] } & Record<any, any>, { "user_id"?: any } & Record<any, any>>,
  res: express.Response<oError>,
  next: express.NextFunction
) {
  switch (typeof req.query.user_id) {
    case "undefined": // posts of login user and his/her friends
      const friendsOfLoginUser = (await Friendship.find({
        "select": { "receiverId": true },
        "where": {
          "requesterId": req.body.loginUserId,
          "status": "friend"
        },
      })).map(friend => friend.receiverId);

      friendsOfLoginUser.push(...(await Friendship.find({
        "select": { "requesterId": true },
        "where": {
          "receiverId": req.body.loginUserId,
          "status": "friend"
        },
      })).map(friend => friend.requesterId));

      friendsOfLoginUser.push(req.body.loginUserId);
      req.body.targetUserId = friendsOfLoginUser;
      next();
      break;
    case "string": // posts of +req.params.user_id
      if (z.number().int().nonnegative().safeParse(+req.query.user_id).success) {
        req.body.targetUserId = [+req.query.user_id];
        next();
        break;
      } else {
        res.status(400).send({ "error": "Invalid user_id" });
        return;
      }
    default:
      res.status(400).send({ "error": "Invalid type of user_id" });
      return;
  }
}

export async function searchPost(
  req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody & { "cursor": PaginationCursor, "targetUserId": number[] }>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
) {
  const posts = await Post.find({
    "relations": {
      "likers": true,
      "poster": true,
    },
    "select": {
      "id": true, "posterId": true, "createdAt": true, "context": true, "commentCount": true,
      "poster": {
        "name": true, "picture": true
      },
      "likers": {
        "id": true, // don't know why this is required
        "likerId": true,
      },
    },
    "where": req.body.targetUserId.map(friendId => {
      return {
        "id": LessThanOrEqual(req.body.cursor.newestPostId),
        "posterId": friendId
      };
    }),
    "take": 11,
    "order": { "createdAt": "DESC" },
    "cache": 60000, // 1 minute
  });

  console.log(
    `user ${req.body.loginUserId} searched post of`,
    req.body.targetUserId.length === 1 ? req.body.targetUserId[0] : "self",
    "with cursor = ", req.body.cursor
  )
  return res.status(200).send({
    "data": {
      "posts": posts.slice(0, 10).map(post => {
        return {
          "id": post.id,
          "user_id": post.posterId,
          "created_at": date2CanchuStr(post.createdAt),
          "context": post.context,
          "is_liked": post.likers!.some(liker => liker.likerId === req.body.loginUserId),
          "like_count": post.likers!.length,
          "comment_count": post.commentCount,
          "picture": convertUserPicture(post.poster!.picture),
          "name": post.poster!.name
        }
      }),
      "next_cursor": posts.length <= 10 ? null : new PaginationCursor(posts[10].id).serialized
    }
  });
}
