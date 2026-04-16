const request = require("supertest");
const app = require("../app");

describe("All API Routes Test", () => {

  test("Auth route working", async () => {
    const res = await request(app).get("/api/auth/login");
    console.log(res.statusCode);
  });

  test("Player route working", async () => {
    const res = await request(app).get("/api/player/profile");
    console.log(res.statusCode);
  });

  test("Test route working", async () => {
    const res = await request(app).get("/api/tests");
    console.log(res.statusCode);
  });

  test("Document route working", async () => {
    const res = await request(app).get("/api/documents/upload");
    console.log(res.statusCode);
  });

  test("Submission route working", async () => {
    const res = await request(app).get("/api/submissions");
    console.log(res.statusCode);
  });

  test("AI route working", async () => {
    const res = await request(app).get("/api/ai/analyze");
    console.log(res.statusCode);
  });

  test("Admin route working", async () => {
    const res = await request(app).get("/api/admin/submissions");
    console.log(res.statusCode);
  });

});