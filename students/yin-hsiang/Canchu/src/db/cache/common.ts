import { init } from "./lib.js";
import { UserStatic } from "./entity/user.js";

export function initDbCache() {
  init(UserStatic);
}
