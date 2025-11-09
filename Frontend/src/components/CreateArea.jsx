import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import { authStorage } from "../utils/authStorage";
import toast from "react-hot-toast";

function CreateArea({ onAdd, showChatbot, onLogout }) {
  const [note, setNote] = useState({
    title: "",
    content: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setNote((prevNote) => {
      return {
        ...prevNote,
        [name]: value,
      };
    });
  }

  async function submitNote(event) {
    event.preventDefault();

    // Simple validation
    if (!note.content || !note.content.trim()) return;

    try {
      // Get token — first from helper if available, otherwise from localStorage
      let token = authStorage.getToken();
      try {
        token =
          typeof authStorage !== "undefined" && authStorage.getToken
            ? authStorage.getToken()
            : localStorage.getItem("token");
      } catch {
        token = localStorage.getItem("token");
      }
      const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${base}/api/notes/add-note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(note),
      });

      if (res.status === 401) {
        // Try to read response body
        const err = await res.json().catch(() => ({}));
        if (err.msg && err.msg.toLowerCase().includes("wygasł")) {
          // Session expired -> remove token and show login
          toast.error("Twoja sesja wygasła. Zaloguj się ponownie.", {
            duration: 4000,
          });
          setTimeout(() => {
            onLogout();
          }, 5000);
          return;
        }
        // Other 401 reason
        console.warn("Unauthorized:", err);
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Błąd zapisu notatki:", res.status, errBody);
        toast.error("Błąd zapisu notatki");
        return;
      }

      const savedNote = await res.json();
      onAdd(savedNote);
      toast.success("Zapisano.");

      // Clear form
      setNote({ title: "", content: "" });
    } catch (error) {
      console.error("Błąd sieci przy zapisie notatki:", error);
      toast.error("Błąd zapisu notatki");
    }
  }

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="notes-section">
      <form className="create-note">
        {isExpanded ? (
          <input
            autoFocus
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
          />
        ) : null}
        <textarea
          onClick={() => setIsExpanded(true)}
          name="content"
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
        />

        {!showChatbot && (
          <Zoom in={isExpanded}>
            <Fab title="Add note" onClick={submitNote}>
              <AddIcon />
            </Fab>
          </Zoom>
        )}
      </form>
    </div>
  );
}

export default CreateArea;
