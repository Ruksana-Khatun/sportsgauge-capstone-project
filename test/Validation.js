const request = require("supertest");
const app = require("../app");
test("Admin route with normal user", async () => {
  const res = await request(app)
    .get("/api/admin/submissions")
    .set("Authorization", `Bearer ${userToken}`);

  expect(res.statusCode).toBe(403);
});
