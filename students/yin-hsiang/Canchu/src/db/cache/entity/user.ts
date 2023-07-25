import { BaseEntity } from "../lib.js";

export class UserStatic extends BaseEntity {
  // user:<userId>
  protected static override REDIS_ROOT = "user";

  public id!: number;
  public name!: string;
  public picture!: Canchu.UserPicture;
  public introduction!: string;
  public tags!: string;
  public friend_count!: number;

  public static async getById(id: number): Promise<Canchu.Cache.IUserDetailObject | null> {
    return await super.get<UserStatic>(id);
  }

  public static async setById(
    id: number,
    value: Canchu.Cache.IUserDetailObject,
    expireTime?: Partial<KeyToType<Property<UserStatic>, number>> | undefined
  ) {
    await super.set<UserStatic>(id, value, expireTime);
  }
}
