import express from "express";
import z from "zod";

import { AccessTokenSuccessBody } from "../users/auth.js";
import { User } from "../db/entity/user.js";
import { ChatMessage } from "../db/entity/chat.js";

type oSuccess = { "data": { "message": { "id": number } } }
type oError = { "error": string }

export async function sendChatMessage(
  req: express.Request<{ user_id: any }, oSuccess | oError, AccessTokenSuccessBody & { "message": any }>,
  res: express.Response<oSuccess | oError>,
  next: express.NextFunction
): Promise<express.Response<oSuccess | oError>> {
  const srcUserId = req.body.loginUserId;
  const targetUserId = +req.params.user_id;
  const message = req.body.message;

  if (typeof message !== "string") {
    return res.status(400).send({ "error": "Invalid message" });
  }
  if (z.number().nonnegative().int().safeParse(targetUserId).success === false) {
    return res.status(400).send({ "error": "Invalid user id to chat" });
  }
  if ((await User.findOneBy({ "id": targetUserId })) === null) {
    return res.status(400).send({ "error": "User not found" });
  }

  let chat = new ChatMessage();
  chat.message = message;
  chat.receiverId = targetUserId;
  chat.senderId = srcUserId;
  try {
    chat = await chat.save();
  } catch (err) {
    console.error(`Error when saving chat:`, err);
    return res.status(500).send({ "error": "Internal database error" });
  }
  console.log(
    `User ${srcUserId} sent DM to ${targetUserId}:`,
    message.length > 10 ? `"${message.slice(0, 8)}..."` : `"${message}"`
  );
  return res.status(200).send({ "data": { "message": { "id": chat.id } } });
}
