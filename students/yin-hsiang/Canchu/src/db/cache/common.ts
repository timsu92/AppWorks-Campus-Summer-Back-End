import { init } from "./lib.js";
import { User } from "./entity/user.js";

export function initDbCache() {
  init(User);
}
