import { DataSource } from "typeorm";

import env from "../../.env.json" assert { type: "json" };
import { User } from "./entity/user.js";
import { Friendship } from "./entity/friendship.js";
import { Event_ } from "./entity/event.js";
import { Post, PostComment, PostLikes } from "./entity/post.js";
import { Group, UserGroup } from "./entity/group.js";

export const Database = new DataSource({
  type: "mysql",
  ...env.sqlCfg,
  entities: [User, Friendship, Event_, Post, PostLikes, PostComment, Group, UserGroup]
})
