import { DataSource } from "typeorm";
import { env as envvar } from "process";

import env from "../../.env.json" assert { type: "json" };
import { User } from "./entity/user.js";
import { Friendship } from "./entity/friendship.js";
import { Event_ } from "./entity/event.js";
import { Post, PostComment, PostLikes } from "./entity/post.js";

const dbCfg = envvar.MODE === "test" ? { ...env.sqlCfg, "database": "canchuTest" } : env.sqlCfg;

export const Database = new DataSource({
  type: "mysql",
  ...dbCfg,
  entities: [User, Friendship, Event_, Post, PostLikes, PostComment]
})
