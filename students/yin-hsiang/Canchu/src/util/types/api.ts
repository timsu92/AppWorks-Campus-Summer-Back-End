import z from 'zod';

export namespace CanchuZod {
  export const FriendshipObject = z.object({
    "id": z.number(),
    "status": z.enum(["pending", "requested", "friend"])
  });

  export const UserDetailObject = z.object({
    "id": z.number().int(),
    "name": z.string().nonempty(),
    "picture": z.string(),
    "friend_count": z.number().nonnegative(),
    "introduction": z.string(),
    "tags": z.string(),
    "friendship": FriendshipObject.or(z.null())
  });
}
