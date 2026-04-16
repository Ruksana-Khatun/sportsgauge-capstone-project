const request = require("supertest");
const app = require("../app");

let token;

describe("JWT Protected Routes Test", () => {

  // 🔐 Step 1: Get token before tests
  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "ruksana123@gmail.com",
        password: "12345678"
      });

    // ✅ Debug (important)
    console.log("LOGIN STATUS:", res.statusCode);
    console.log("LOGIN BODY:", res.body);

    // ❗ Safety check (very important)
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");

    token = res.body.token;
  });

  // ❌ No token
  test("Access without token should fail", async () => {
    const res = await request(app)
      .get("/api/player/profile");

    console.log("NO TOKEN:", res.statusCode);

    expect(res.statusCode).toBe(401);
  });

  // ❌ Invalid token
  test("Access with wrong token should fail", async () => {
    const res = await request(app)
      .get("/api/player/profile")
      .set("Authorization", "Bearer wrongtoken");

    console.log("WRONG TOKEN:", res.statusCode);

    expect(res.statusCode).toBe(401);
  });

  // ✅ Valid token
  test("Access with valid token should pass", async () => {
    const res = await request(app)
      .get("/api/player/profile")
      .set("Authorization", `Bearer ${token}`);

    console.log("VALID TOKEN:", res.statusCode, res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined(); // optional check
  });

});