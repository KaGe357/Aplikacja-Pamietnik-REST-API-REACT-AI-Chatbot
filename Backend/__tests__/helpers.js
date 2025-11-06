import request from "supertest";
import app from "../server.js";

async function registerAndLoginTestUser(username, password) {
  const response = await request(app)
    .post("/api/auth/register")
    .send({ username, password });

  await request(app).post("/api/auth/login").send({ username, password });

  return response;
}

async function getAuthTokenForUser(username, password) {
  await registerAndLoginTestUser(username, password);

  const response = await request(app)
    .post("/api/auth/login")
    .send({ username, password });
  return response.body.token;
}

async function createNote(token, noteData) {
  const response = await request(app)
    .post("/api/notes/add-note")
    .set("Authorization", `Bearer ${token}`)
    .send(noteData);
  return response.body;
}

export { registerAndLoginTestUser, getAuthTokenForUser, createNote };
