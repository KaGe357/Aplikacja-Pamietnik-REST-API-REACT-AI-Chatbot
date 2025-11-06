import express from "express";
import authenticateToken from "../middleware/auth.js";
import logger from "../config/logger.js";
import db from "../config/database.js";

const router = express.Router();

// Protected endpoint - only for logged-in users
router.get("/my-notes", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    const notes = await db("notes")
      .select(
        "id",
        "note_title as title",
        "note_content as content",
        "created_at",
        "updated_at"
      )
      .where("user_id", userId)
      .orderBy("created_at", "desc");

    logger.info("Notes fetched", {
      userId: req.user.id,
      count: notes.length,
    });

    res.json(notes);
  } catch (error) {
    logger.error("Error fetching notes", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || "unknown",
    });
    res.status(500).json({ msg: "Błąd pobierania notatek" });
  }
});

router.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const userId = req.user.id;
    const newNote = await db("notes")
      .insert({
        user_id: userId,
        note_title: title,
        note_content: content,
      })
      .returning("*");

    const savedNote = newNote[0];
    const responseNote = {
      id: savedNote.id,
      title: savedNote.note_title,
      content: savedNote.note_content,
      created_at: savedNote.created_at,
      updated_at: savedNote.updated_at,
    };

    logger.info("Note created", {
      userId: req.user.id,
      noteId: savedNote.id,
      titleLength: title.length,
      contentLength: content.length,
    });
    res.status(201).json(responseNote);
  } catch (error) {
    logger.error("Error adding note", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      ip: req.ip,
    });
    res.status(500).json({ msg: "Błąd dodawania notatki" });
  }
});

router.delete("/delete-note/:id", authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  try {
    const userId = req.user.id;
    const deleteResult = await db("notes")
      .where({
        id: noteId,
        user_id: userId,
      })
      .del();

    if (!deleteResult) {
      logger.warn("Note delete failed: not found or unauthorized", {
        userId: req.user.id,
        noteId: noteId,
      });
      return res.status(404).json({ msg: "Notatka nie znaleziona" });
    }
    logger.info("Note deleted", {
      userId: req.user.id,
      noteId: noteId,
    });
    return res.json({ msg: "Notatka usunięta", id: noteId });
  } catch (error) {
    logger.error("Database error in notes", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      endpoint: req.originalUrl,
    });
    res.status(500).json({ msg: "Błąd serwera" });
  }
});

export default router;
