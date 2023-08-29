import { init } from "./lib.js";
import { User } from "./entity/user.js";
import { Friendship } from "./entity/friendship.js";

export function initDbCache() {
  init(User, Friendship);
}
