import { DataSource } from "typeorm";
import { env as envvar } from "process";

import env from "../../.env.json" assert { type: "json" };
import { User } from "./entity/user.js";
import { Friendship } from "./entity/friendship.js";
import { Event_ } from "./entity/event.js";
import { Post, PostComment, PostLikes } from "./entity/post.js";

if (envvar.MODE === "test") {
  console.info("DB running in test mode");
}

export const Database = new DataSource({
  type: "mysql",
  ...env.sqlUser,
  host: envvar.TARGET === "local" || envvar.MODE === "test"
    ? "canchu-mysql-1"
    : env.RDSAddr,
  database: envvar.MODE === "test"
    ? "canchuTest"
    : "canchu",
  entities: [User, Friendship, Event_, Post, PostLikes, PostComment]
})
