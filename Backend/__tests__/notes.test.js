import request from "supertest";
import app from "../server.js";
import { getAuthTokenForUser, createNote } from "./helpers.js";
import { test, expect, describe } from "vitest";

describe("Notes API", () => {
  test("should require auth for /my-notes", async () => {
    const response = await request(app).get("/api/notes/my-notes");

    expect(response.status).toBe(401);
  });
});

test("should return only current users notes", async () => {
  const user1Token = await getAuthTokenForUser("user1", "password1@");
  const user2Token = await getAuthTokenForUser("user2", "password2@");

  await createNote(user1Token, { title: "User1 Note", content: "Content 1" });
  await createNote(user2Token, { title: "User2 Note", content: "Content 2" });

  await request(app)
    .get("/api/notes/my-notes")
    .set("Authorization", `Bearer ${user1Token}`);
});

test("should NOT allow deleting another users note", async () => {
  const user1Token = await getAuthTokenForUser("user1", "password1@");
  const user2Token = await getAuthTokenForUser("user2", "password2@");

  const note = await createNote(user2Token, {
    title: "User2 Note",
    content: "Content 2",
  });
  
  console.log("Created note:", note);
  console.log("Note ID:", note?.id);

  const response = await request(app)
    .delete(`/api/notes/delete-note/${note.id}`)
    .set("Authorization", `Bearer ${user1Token}`);

  expect(response.status).toBe(404);
});
