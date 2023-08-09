import { randomBytes, randomInt, randomUUID } from "crypto";
import { SingleBar } from "cli-progress";

import { Post } from "../../src/db/entity/post.js";
import { User } from "../../src/db/entity/user.js";
import { Database } from "../../src/db/data-source.js";

async function main() {
  await Database.initialize();

  let usr = new User();
  usr.provider = "native";
  usr.email = `test-${randomUUID()}@test.com`;
  usr.password = randomUUID();
  usr = await usr.save();
  console.log(`creating 5000 posts using "user id ${usr.id}"`);

  const bar = new SingleBar({});
  bar.start(5000, 0);

  for (let _ = 0; _ < 5000; ++_) {
    await Post.insert({
      "posterId": usr.id,
      "context": randomBytes(randomInt(10)).toString("utf8")
    });
    bar.increment();
  }

  await Database.destroy()
}

main();
