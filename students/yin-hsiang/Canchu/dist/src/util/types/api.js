import z from 'zod';
export var CanchuZod;
(function (CanchuZod) {
    CanchuZod.FriendshipObject = z.object({
        "id": z.number(),
        "status": z.enum(["pending", "requested", "friend"])
    });
    CanchuZod.UserDetailObject = z.object({
        "id": z.number().int(),
        "name": z.string().nonempty(),
        "picture": z.string(),
        "friend_count": z.number().nonnegative(),
        "introduction": z.string(),
        "tags": z.string(),
        "friendship": CanchuZod.FriendshipObject.or(z.null())
    });
})(CanchuZod || (CanchuZod = {}));
//# sourceMappingURL=api.js.map