import { expect } from "chai";
import request from "supertest";

import env from "../../.env.json" assert {type: "json"};
import { app } from "../../src/index.js";
import { User } from "../../src/db/entity/user.js";

describe("signup", () => {
  const account = {
    "provider": "native",
    "name": "test_",
    "email": "test_@test.com",
    "password": "test"
  } as const;

  afterEach("remove test account", async () => {
     await User.delete({
      "provider": account.provider,
      "name": account.name,
      "email": account.email
    });
  })

  it("normal signup", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signup`)
      .send(account);
    expect(response.statusCode).to.equal(200, "statusCode should be 200");
  })

  it("invalid name", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signup`)
      .send({
        ...account,
        "name": ""
      });
    expect(response.statusCode, "statusCode should be 400").equal(400);
  })

  it("invalid email", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signup`)
      .send({
        ...account,
        "email": ""
      });
    expect(response.statusCode, "statusCode should be 400").equal(400);
  })

  it("invalid password", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signup`)
      .send({
        ...account,
        "password": ""
      });
    expect(response.statusCode, "statusCode should be 400").equal(400);
  })

  it("duplicate signup", async () => {
    const response = await request(app)
      .post(`/api/${env.apiVer}/users/signup`)
      .send(account);
    expect(response.statusCode).to.equal(200, "first account creation statusCode should be 200");

    const response1 = await request(app)
      .post(`/api/${env.apiVer}/users/signup`)
      .send(account);
    expect(response1.statusCode).to.equal(403, "second account creation statusCode should be 403");
  })
})
