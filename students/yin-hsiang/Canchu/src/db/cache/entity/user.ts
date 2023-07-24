import assert from "assert";

import { armorUserPicture } from "../../../util/util.js";
import { BaseEntity } from "../lib.js";

export class UserStatic extends BaseEntity {
  // user:<userId>
  protected static override REDIS_ROOT = "user";

  public static async getById(id: number): Promise<Canchu.Cache.IUserDetailObject | null> {
    assert(UserStatic._redis);
    const result = await UserStatic._redis.hgetall(`${UserStatic.REDIS_ROOT}:${id}`);
    if (Object.values(result).every(val => val === null)) {
      return null;
    }
    return {
      "id": Number(result.id),
      "name": result.name,
      "picture": armorUserPicture(result.picture),
      "introduction": result.introduction,
      "tags": result.tags
    };
  }

  public static async setById(
    id: number,
    value: Omit<Canchu.Cache.IUserDetailObject, "picture"> & { "picture": string }
  ) {
    assert(UserStatic._redis);
    await UserStatic._redis.hset(`${UserStatic.REDIS_ROOT}:${id}`, value);
  }
}
