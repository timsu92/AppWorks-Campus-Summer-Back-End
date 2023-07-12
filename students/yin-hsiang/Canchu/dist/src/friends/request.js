import { User } from '../db/entity/user.js';
import { Friendship } from '../db/entity/friendship.js';
export default async function (req, res, next) {
    if (!Number.isInteger(+req.params.user_id)) {
        res.status(400).send({ "error": "invalid user_id" });
        return;
    }
    const receiverId = +req.params.user_id;
    const requesterId = req.body.loginUserId;
    if (requesterId === receiverId) {
        res.status(400).send({ "error": "can't make friend with self" });
        return;
    }
    const requester = await User.findOneBy({ "id": requesterId });
    if (requester === null) {
        res.status(403).send({ "error": "invalid token" });
        return;
    }
    const receiver = await User.findOneBy({ "id": receiverId });
    if (receiver === null) {
        res.status(400).send({ "error": "user not found" });
        return;
    }
    let friendship = await Friendship.findOneBy({ "requesterId": requesterId, "receiverId": receiverId });
    if (friendship) {
        if (friendship.status === "requested") {
            res.status(400).send({ "error": "already requested" });
            return;
        }
        else {
            res.status(400).send({ "error": "already friend" });
            return;
        }
    }
    friendship = new Friendship();
    friendship.requester = requester;
    friendship.receiver = receiver;
    friendship.status = "requested";
    try {
        friendship = await friendship.save();
        res.status(200).send({
            "data": {
                "friendship": {
                    "id": friendship.id,
                    "status": friendship.status
                }
            }
        });
        console.log(requesterId, "requests to make friend with", receiverId);
        next();
    }
    catch (err) {
        res.status(500).send({ "error": "internal database error" });
        console.error("error while creating friendship:", err);
        return;
    }
}
//# sourceMappingURL=request.js.map