import "reflect-metadata";
import * as jwt from "./users/jwt.js";
// const db = (await Database.initialize());
/* const a = new User()
a.name = "test";
a.email = "test@test.com";
a.password = "test";
await a.save(); */
/* const b = new User();
b.name = "test";
b.email = "test1@test.com";
b.password = "test";
await b.save() */
/* const a = await User.findOneBy({"email": "test@test.com"}) as User;
const b = await User.findOneBy({"email": "test1@test.com"}) as User;

const friendship = new Friendship();
friendship.requester = a;
friendship.receiver = b;
friendship.status = "requested";
try {
  await friendship.save();
} catch (err) {
  if(err instanceof typeorm.QueryFailedError){
    console.warn(err);
  }
}
console.log("done"); */
console.log(await jwt.encode({ "id": 1 }));
//# sourceMappingURL=test.js.map