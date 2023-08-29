import { expect } from "chai";
import request from "supertest";

import env from '../../.env.json' assert {type: "json"};
import { app } from "../../src/index.js";
import { User } from "../../src/db/entity/user.js";

describe("signin", () => {
  const account = {
    "provider": "native",
    "name": "test_",
    "email": "test_@test.com",
    "password": "test"
  } as const;

  beforeEach("create test account", async () => {
    await request(app)
      .post(`/api/${env.apiVer}/users/signup`)
      .send(account);
  });

  afterEach("remove test account", async () => {
    await User.delete({
      "provider": account.provider,
      "name": account.name,
      "email": account.email
    });
  })

  it("normal login", async function () {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signin`)
      .send(account);
    expect(response.statusCode, "status code should be 200: " + JSON.stringify(response.body)).equal(200);
    expect(response.body).to.have.property("data");
    expect(response.body.data).to.have.property("access_token").and.that.is.a("string");
    expect(response.body.data).to.have.property("user");
    expect(response.body.data.user.id).is.a("number").and.greaterThan(0);
    expect(response.body.data.user.provider).a.string("native");
    expect(response.body.data.user.name).a.string("test");
  })

  it("login with unknown user", async function() {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signin`)
      .send({
        "provider": "native",
        "name": "sdfjs;dfjsd",
        "email": "fjsdkffsfjsasd@fsadjflbkdj.com",
        "password": "asdfjs;dljfkljksdfjkfjsdk jfosd "
      });
    expect(response.statusCode, "status code should be 403: " + JSON.stringify(response.body)).equal(403);
  })

  it("wrong provider", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signin`)
      .send({
        ...account,
        "provider": "djsf;asdjfslkd"
      });
    expect(response.statusCode, "status code should be 403").equal(403);
  })

  it("invalid email", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signin`)
      .send({
        ...account,
        "email": "djsf;asdjfslkd"
      });
    expect(response.statusCode, "status code should be 400").equal(400);
  })

  it("unsupported facebook login", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signin`)
      .send({
        "provider": "facebook",
        "access_token": "sjflksjlkfsdklfjsadlkf"
      });
    expect(response.statusCode, "status code should be 500").equal(500);
  })
})
