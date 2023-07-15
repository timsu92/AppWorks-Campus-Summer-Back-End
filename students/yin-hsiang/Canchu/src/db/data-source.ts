import { DataSource } from "typeorm";

import env from "../../.env.json" assert { type: "json" };
import { User } from "./entity/user.js";
import { Friendship } from "./entity/friendship.js";
import { Event_ } from "./entity/event.js";
import { Post } from "./entity/post.js";

export const Database = new DataSource({
  type: "mysql",
  ...env.sqlCfg,
  username: "dev",
  entities: [User, Friendship, Event_, Post]
})
