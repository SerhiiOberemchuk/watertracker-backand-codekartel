import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";
import "dotenv/config";

const { PORT = 3000, DB_HOST } = process.env;

describe("test api/users/login function", () => {
  let server = null;
  beforeAll(async () => {
    await mongoose.connect(DB_HOST);
    server = app.listen(PORT);
  });
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });
  test("test /login with correct data", async () => {
    const loginData = {
      email: "serhii@i.ua",
      password: "123456",
    };
    const { statusCode, body } = await request(app)
      .post("/api/users/login")
      .send(loginData);

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("token");
    expect(body).toHaveProperty("user");
    const { user } = body;
    expect(typeof user.email).toBe("string");
    expect(typeof user.subscription).toBe("string");
  });
});
