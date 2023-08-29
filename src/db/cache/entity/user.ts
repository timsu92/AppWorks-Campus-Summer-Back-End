import { BaseEntity } from "../lib.js";

export class User extends BaseEntity {
  // user:<userId>
  protected static override REDIS_ROOT = "user";

  public id!: number;
  public name!: string;
  public picture!: Canchu.UserPicture;
  public introduction!: string;
  public tags!: string;
  public friend_count!: number;

  public static async getById(id: number): Promise<Canchu.Cache.IUserDetailObject | undefined> {
    return await super.get<User>(id);
  }

  public static async setById(
    id: number,
    value: Canchu.Cache.IUserDetailObject,
    expireTime?: Partial<KeyToType<Property<User>, number>> | undefined
  ) {
    await super.set<User>(id, value, expireTime);
  }

  public static async delById(id: number) {
    await super.del<User>(id);
  }
}
