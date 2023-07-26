import { BaseEntity } from "../lib.js";

export class Friendship extends BaseEntity {
  // friendship:<userId>_<userId>
  protected static override REDIS_ROOT: string = "friendship";
  private static INVALID_FRIENDSHIP_ID = Number.MIN_SAFE_INTEGER;

  public id!: number;
  public status!: "pending" | "requested" | "friend";

  public static async getByUserIds(userIds: readonly [number, number]): Promise<Canchu.IFriendshipObject | null | undefined> {
    const [userIdSmall, userIdBig] = [Math.min(...userIds), Math.max(...userIds)];
    const result = await super.get<Friendship>(`${userIdSmall}_${userIdBig}`);
    if (result === undefined) {
      return undefined;
    } else if (result.id === this.INVALID_FRIENDSHIP_ID) {
      return null;
    } else if (userIds[0] === userIdSmall && userIds[1] === userIdBig) {
      return result;
    } else {
      return {
        "id": result.id,
        "status": result.status === "friend"
          ? "friend"
          : result.status === "requested"
            ? "pending"
            : "requested"
      };
    }
  }

  public static async setByUserIds(userIds: readonly [number, number], value: Canchu.IFriendshipObject | null, expireSecond?: Partial<KeyToType<Property<Friendship>, number>> | undefined) {
    const [userIdSmall, userIdBig] = [Math.min(...userIds), Math.max(...userIds)];
    await super.set<Friendship>(
      `${userIdSmall}_${userIdBig}`,
      value === null
        ? {
          "id": this.INVALID_FRIENDSHIP_ID,
          "status": "friend" // dummy
        }
        : {
          "id": value.id,
          "status": userIds[0] === userIdSmall && userIds[1] === userIdBig
            ? value.status
            : value.status === "friend"
              ? "friend"
              : value.status === "requested"
                ? "pending"
                : "requested"
        },
      expireSecond)
  }

  public static async delByUserIds(userIds: readonly [number, number]) {
    const [userIdSmall, userIdBig] = [Math.min(...userIds), Math.max(...userIds)];
    await super.del<Friendship>(`${userIdSmall}_${userIdBig}`);
  }
}
