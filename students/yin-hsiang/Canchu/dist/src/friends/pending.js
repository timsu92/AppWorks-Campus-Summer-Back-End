import { Friendship } from '../db/entity/friendship.js';
export default async function (req, res, next) {
    const receiverId = req.body.loginUserId;
    const friendships = await Friendship.find({ "where": { receiverId, "status": "requested" }, "relations": ["requester"] });
    friendships.map(relation => {
        console.log(relation);
    });
    res.status(200).send({
        "data": {
            "users": friendships.map(relation => {
                return {
                    "id": relation.requester.id,
                    "name": relation.requester.name,
                    "picture": relation.requester.picture,
                    "friendship": {
                        "id": relation.id,
                        "status": relation.status
                    }
                };
            })
        }
    });
    console.log(`user ${receiverId} listed pending friends`);
    next();
}
//# sourceMappingURL=pending.js.map