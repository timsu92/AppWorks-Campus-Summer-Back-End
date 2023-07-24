import { Redis } from "ioredis";

import env from '../../../.env.json' assert {type: "json"};

export function newRedis() {
  return new Redis(env.cacheCfg);
}

export class BaseEntity {
  protected static _redis?: Redis;
  protected static REDIS_ROOT: string;

  public static init() {
    BaseEntity._redis = newRedis();
  }
}

export function init(...entities: typeof BaseEntity[]) {
  entities.forEach(entity => entity.init());
}
