import request from "supertest";
import app from "../server.js";
import { test, expect } from "vitest";

test("Test - registration with invalid username", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "aq",
    password: "strongPass1@",
  });
  expect(response.status).toBe(400);
  expect(response.body.msg).toContain("Nazwa użytkownika");
});

test("Test - registration with weak password", async () => {
  const response = await request(app).post("/api/auth/register").send({
    username: "pawel",
    password: "qwe",
  });
  expect(response.status).toBe(400);
  expect(response.body.msg).toContain("Hasło");
});

test("Test - successful registration", async () => {
  const uniqueUsername = "u" + Date.now().toString().slice(-10); // max 11 chars
  const response = await request(app).post("/api/auth/register").send({
    username: uniqueUsername,
    password: "strongPass1@",
  });

  console.log("Registration response status:", response.status);
  console.log("Registration response body:", response.body);

  expect(response.status).toBe(201);
  expect(response.body.message || response.body.msg).toBeTruthy();
});

test("Test - login with nonexistent user", async () => {
  const response = await request(app).post("/api/auth/login").send({
    username: "nonexistent_user_12345",
    password: "wrongPassword",
  });
  expect(response.status).toBe(401);
});

test("Test - successful login", async () => {
  const username = "log" + Date.now().toString().slice(-10); // max 13 chars
  const password = "TestPass1@";

  await request(app).post("/api/auth/register").send({ username, password });

  // Then login
  const response = await request(app).post("/api/auth/login").send({
    username,
    password,
  });
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("token");
});
