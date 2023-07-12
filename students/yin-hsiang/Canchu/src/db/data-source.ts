import { DataSource } from "typeorm";

import env from "../../.env.json" assert { type: "json" };
import { User, UserObject, UserObjectPasswd } from "./entity/user.js";
import { Friendship } from "./entity/friendship.js";

export const Database = new DataSource({
  type: "mysql",
  ...env.sqlCfg,
  username: "dev",
  entities: [User, UserObject, UserObjectPasswd, Friendship]
})
