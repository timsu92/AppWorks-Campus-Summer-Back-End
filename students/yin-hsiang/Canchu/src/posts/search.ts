import express from 'express';
import z from 'zod';
import { base64url } from 'jose';
import { LessThanOrEqual } from 'typeorm';

import { Post } from '../db/entity/post.js';
import { Friendship } from '../db/entity/friendship.js';

import { AccessTokenSuccessBody } from '../users/auth.js';
import { date2CanchuStr } from '../util/util.js';

class PaginationCursor {
  private _newestPostId: number;
  private _targetUserId: number[];

  constructor(newestPostId: number, targetUserId: number[]) {
    this._newestPostId = newestPostId;
    this._targetUserId = targetUserId;
  }

  public static fromSerialized(serializedJson: string): PaginationCursor {
    const decoded = JSON.parse(base64url.decode(serializedJson).toString());
    return new PaginationCursor(decoded._newestPostId, decoded._targetUserId);
  }

  public get newestPostId() { return this._newestPostId; }
  public get targetUserId() { return this._targetUserId; }
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
  req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody & { "cursor": PaginationCursor }, { "user_id"?: any, "cursor"?: any }>,
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
      if (typeof req.query.user_id !== "undefined" && req.body.cursor.targetUserId.includes(+req.query.user_id) === false) {
        res.status(400).send({ "error": "User_id and cursor did not match" });
        return;
      }
      next();
      break;
    case "undefined": // req.params.cursor
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
          req.body.cursor = new PaginationCursor(Number.MAX_VALUE, friendsOfLoginUser);
          next();
          break;
        case "string": // maybe posts of +req.params.user_id
          if (z.number().int().nonnegative().safeParse(+req.query.user_id).success) {
            req.body.cursor = new PaginationCursor(Number.MAX_VALUE, [+req.query.user_id]);
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
      break;
    default: // req.params.cursor
      res.status(400).send({ "error": "Invalid type of cursor" });
      return;
  }
}

export async function searchPost(
  req: express.Request<{}, oSuccess | oError, AccessTokenSuccessBody & { "cursor": PaginationCursor }>,
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
        "likerId": true,
      },
    },
    "where": req.body.cursor.targetUserId.map(friendId => {
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
    req.body.cursor.targetUserId.length === 1 ? req.body.cursor.targetUserId[0] : "self",
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
          "picture": post.poster!.picture,
          "name": post.poster!.name
        }
      }),
      "next_cursor": posts.length <= 10 ? null : new PaginationCursor(posts[10].id, req.body.cursor.targetUserId).serialized
    }
  });
}
