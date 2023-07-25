import { Redis } from "ioredis";

import env from '../../../.env.json' assert {type: "json"};
import assert from "assert";

export function newRedis() {
  return new Redis(env.cacheCfg);
}

// 取得物件中所有的property以及其原型鏈上的property
function getAllNonFunctionKeys(obj: object): string[] {
  const keys: string[] = [];

  for (let current = obj; current !== null; current = Object.getPrototypeOf(current)) {
    const ownKeys = Object.getOwnPropertyNames(current);

    for (const key of ownKeys) {
      // @ts-expect-error
      if (key !== '__proto__' && typeof current[key] !== 'function') {
        keys.push(key);
      }
    }
  }

  return keys;
}

export class BaseEntity {
  protected static _redis?: Redis;
  protected static REDIS_ROOT: string;

  public static init<U extends BaseEntity>(this: { new(): U }) {
    // setup redis of derived class
    (this as unknown as typeof BaseEntity)._redis = newRedis();
  }

  public static async set<U extends BaseEntity>(
    this: { new(): U },
    where: string | number,
    value: Property<U>,
    expireTime?: Partial<KeyToType<Property<U>, number>>
  ) {
    const this_ = this as unknown as typeof BaseEntity;
    assert(this_._redis);
    const transaction = this_._redis.multi();
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === "string" || typeof val === "number") {
        transaction.set(
          `${this_.REDIS_ROOT}:${where}:${key}`,
          val,
          "EX",
          // @ts-expect-error
          expireTime?.[key] ?? 86400); // expires in a day
      } else {
        transaction.set(
          `${this_.REDIS_ROOT}:${where}:${key}`, JSON.stringify(val), "EX",
          // @ts-expect-error
          expireTime?.[key] ?? 86400); // expires in a day
      }
    }
    const execStatus = await transaction.exec();
    if (execStatus === null) {
      return;
    }
    for (const status of execStatus) {
      if (status[0] !== null) {
        throw status[0];
      }
    }
  }

  public static async get<U extends BaseEntity>(this: { new(): U }, where: string | number): Promise<U | undefined> {
    const this_ = this as unknown as typeof BaseEntity;
    assert(this_._redis);
    const object = {};
    for (const key of getAllNonFunctionKeys(new this_())) {
      // @ts-expect-error
      if (typeof this_[key] === "string" || typeof this_[key] === "number") {
        const retrieved = await this_._redis.get(`${this_.REDIS_ROOT}:${where}:${key}`);
        if (retrieved === null) {
          return undefined;
        }
        // @ts-expect-error
        object[key] = retrieved;
      } else {
        const unknownValue = await this_._redis.get(`${this_.REDIS_ROOT}:${where}:${key}`);
        if (unknownValue === null)
          return undefined;
        try {
          // @ts-expect-error
          object[key] = JSON.parse(unknownValue);
        } catch (err) {
          // @ts-expect-error
          object[key] = unknownValue;
        }
      }
    }
    return object as U;
  }

  public static async del<U extends BaseEntity>(this: { new(): U }, where: string | number) {
    const this_ = this as unknown as typeof BaseEntity;
    assert(this_._redis);
    const transaction = this_._redis.multi();
    for (const key of getAllNonFunctionKeys(new this_())) {
      transaction.del(`${this_.REDIS_ROOT}:${where}:${key}`);
    }
    const execStatus = await transaction.exec();
    if (execStatus === null) {
      return;
    }
    for (const status of execStatus) {
      if (status[0] !== null) {
        throw status[0];
      }
    }
  }
}

export function init(...entities: { new(): BaseEntity }[]) {
  entities.forEach(entity => (entity as unknown as typeof BaseEntity).init());
}
