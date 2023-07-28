import express from "express";
import { base64url } from "jose";
import z from "zod";

import { AccessTokenSuccessBody } from "../users/auth.js";
import { ChatMessage } from "../db/entity/chat.js";
import { armorUserPicture, date2CanchuStr } from "../util/util.js";
import { LessThanOrEqual } from "typeorm";

class PaginationCursor {
  private _newestChatId: number;

  constructor(newestChatId: number) {
    this._newestChatId = newestChatId;
  }

  public static fromSerialized(serializedJson: string): PaginationCursor {
    const decoded = JSON.parse(base64url.decode(serializedJson).toString());
    return new PaginationCursor(decoded._newestChatId);
  }

  public get newestChatId() { return this._newestChatId; }
  public get serialized() { return base64url.encode(JSON.stringify(this)); }
}

type oSuccess = {
  "data": {
    "messages": Canchu.IChatMessageObject[],
    "next_cursor": string | null
  }
}

type oError = { "error": string }

export async function genCursor(
  req: express.Request<any, oError, { "cursor": PaginationCursor } & Record<any, any>, { "cursor"?: any } & Record<any, any>>,
  res: express.Response<oError>,
  next: express.NextFunction
) {
  switch (typeof req.query.cursor) {
    case "string":
      try {
        req.body.cursor = PaginationCursor.fromSerialized(req.query.cursor);
      } catch (e) {
        return res.status(400).send({ "error": "Invalid cursor. Can't transform" });
      }
      return next();
    case "undefined":
      req.body.cursor = new PaginationCursor(Number.MAX_SAFE_INTEGER);
      return next();
    default:
      return res.status(400).send({ "error": "Invalid type of cursor" });
  }
}

export async function chatHistory(
  req: express.Request<{user_id: any}, oSuccess | oError, AccessTokenSuccessBody & {"cursor": PaginationCursor}>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
): Promise<express.Response<oSuccess | oError>> {
  const userId1 = req.body.loginUserId;
  const userId2 = +req.params.user_id;
  const cursor = req.body.cursor;

  if(z.number().nonnegative().int().safeParse(userId2).success === false){
    return res.status(400).send({"error": "Invalid user id"});
  }

  const chats = await ChatMessage.find({
    "relations": {"sender": true},
    "where": [
      {"senderId": userId1, "receiverId": userId2, "id": LessThanOrEqual(cursor.newestChatId)},
      {"senderId": userId2, "receiverId": userId1, "id": LessThanOrEqual(cursor.newestChatId)},
    ],
    "order": {"createdAt": "DESC"},
    "take": 11
  });

  return res.status(200).send({"data": {
    "messages": chats.slice(0, 10).map(chat => {
      return {
        "id": chat.id,
        "message": chat.message,
        "created_at": date2CanchuStr(chat.createdAt),
        "user": {
          "id": chat.sender!.id,
          "name": chat.sender!.name,
          "picture": armorUserPicture(chat.sender!.picture)
        }
      };
    }),
    "next_cursor": chats.length <= 10 ? null : new PaginationCursor(chats[10].id).serialized
  }});
}
