import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../server/app.js";
import User from "../server/models/userModel.js";

let mongo;
let agent;

const userPayload = (overrides = {}) => ({
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  ...overrides,
});

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  agent = request.agent(app);
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("signup", () => {
  it("creates a user with hashed password and OTP (dev)", async () => {
    const res = await request(app).post("/api/auth/signup").send(userPayload());
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.otp, "OTP returned in non-production");
    assert.ok(res.headers["set-cookie"], "sets auth cookie");

    // user object must not leak secrets
    assert.equal(res.body.user.password, undefined);
    assert.equal(res.body.user.verificationOTP, undefined);
    assert.equal(res.body.user.resetPasswordToken, undefined);

    const dbUser = await User.findOne({ email: "test@example.com" }).select(
      "+password +verificationOTP +verificationOTPExpireAt"
    );
    assert.ok(dbUser);
    assert.notEqual(dbUser.password, "password123");
    assert.ok(dbUser.verificationOTP);
  });

  it("rejects missing fields and short passwords", async () => {
    const missing = await request(app)
      .post("/api/auth/signup")
      .send({ email: "a@b.com" });
    assert.equal(missing.status, 400);

    const short = await request(app)
      .post("/api/auth/signup")
      .send(userPayload({ password: "123" }));
    assert.equal(short.status, 400);
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/signup").send(userPayload());
    const dup = await request(app).post("/api/auth/signup").send(userPayload());
    assert.equal(dup.status, 400);
  });
});

describe("verify-email", () => {
  it("verifies with the correct OTP", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send(userPayload());
    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ code: signup.body.otp, email: "test@example.com" });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.isVerified, true);
    assert.equal(res.body.user.password, undefined);
    assert.equal(res.body.user.verificationOTP, undefined);
  });

  it("rejects wrong OTP and already-verified accounts", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send(userPayload());
    const wrong = await request(app)
      .post("/api/auth/verify-email")
      .send({ code: "000000", email: "test@example.com" });
    assert.equal(wrong.status, 400);

    await request(app)
      .post("/api/auth/verify-email")
      .send({ code: signup.body.otp, email: "test@example.com" });
    const again = await request(app)
      .post("/api/auth/verify-email")
      .send({ code: signup.body.otp, email: "test@example.com" });
    assert.equal(again.status, 400);
  });

  it("locks out after 5 wrong attempts", async () => {
    await request(app).post("/api/auth/signup").send(userPayload());
    let first;
    let last;
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/verify-email")
        .send({ code: "000000", email: "test@example.com" });
      if (i === 0) first = res;
      last = res;
    }
    assert.equal(first.status, 400);
    assert.equal(first.body.attemptsLeft, 4);
    assert.equal(last.status, 429);
    assert.equal(last.body.attemptsLeft, 0);

    const dbUser = await User.findOne({ email: "test@example.com" }).select(
      "+verificationOTP +verificationOTPExpireAt"
    );
    assert.equal(dbUser.verificationOTP, undefined);
  });
});

describe("resend-verification", () => {
  it("enforces the 60s server-side cooldown", async () => {
    await request(app).post("/api/auth/signup").send(userPayload());
    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "test@example.com" });
    assert.equal(res.status, 429);
    assert.ok(res.body.retryAfter > 0);
  });

  it("issues a new OTP after the cooldown", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send(userPayload());
    await User.updateOne(
      { email: "test@example.com" },
      { lastOTPSentAt: Date.now() - 61 * 1000 }
    );
    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "test@example.com" });
    assert.equal(res.status, 200);
    assert.ok(res.body.otp);
    assert.notEqual(res.body.otp, signup.body.otp);
  });
});

describe("login / check-auth / logout", () => {
  it("rejects unknown users and wrong passwords", async () => {
    const unknown = await request(app)
      .post("/api/auth/login")
      .send({ email: "no@user.com", password: "password123" });
    assert.equal(unknown.status, 400);

    await request(app).post("/api/auth/signup").send(userPayload());
    const wrong = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpass" });
    assert.equal(wrong.status, 400);
  });

  it("logs in, exposes check-auth without secrets, then logs out", async () => {
    await request(app).post("/api/auth/signup").send(userPayload());

    const login = await agent
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.password, undefined);
    assert.equal(login.body.user.verificationOTP, undefined);
    assert.equal(login.body.user.resetPasswordToken, undefined);

    const me = await agent.get("/api/auth/check-auth");
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, "test@example.com");
    assert.equal(me.body.user.password, undefined);
    assert.equal(me.body.user.verificationOTP, undefined);
    assert.equal(me.body.user.resetPasswordToken, undefined);

    const logout = await agent.post("/api/auth/logout");
    assert.equal(logout.status, 200);

    const after = await agent.get("/api/auth/check-auth");
    assert.equal(after.status, 401);
  });

  it("check-auth rejects requests without a token", async () => {
    const res = await request(app).get("/api/auth/check-auth");
    assert.equal(res.status, 401);
  });
});

describe("forgot / reset password", () => {
  it("runs the full reset flow", async () => {
    await request(app).post("/api/auth/signup").send(userPayload());

    const missing = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "no@user.com" });
    assert.equal(missing.status, 404);

    const forgot = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "test@example.com" });
    assert.equal(forgot.status, 200);
    assert.ok(forgot.body.resetToken);

    const badToken = await request(app)
      .post("/api/auth/reset-password/invalidtoken")
      .send({ password: "newpassword123" });
    assert.equal(badToken.status, 400);

    const short = await request(app)
      .post(`/api/auth/reset-password/${forgot.body.resetToken}`)
      .send({ password: "123" });
    assert.equal(short.status, 400);

    const reset = await request(app)
      .post(`/api/auth/reset-password/${forgot.body.resetToken}`)
      .send({ password: "newpassword123" });
    assert.equal(reset.status, 200);

    const loginNew = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "newpassword123" });
    assert.equal(loginNew.status, 200);

    const loginOld = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    assert.equal(loginOld.status, 400);
  });
});
