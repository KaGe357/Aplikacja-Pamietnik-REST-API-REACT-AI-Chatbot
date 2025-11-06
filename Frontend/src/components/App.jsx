import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import "../ChatbotStyles.css";
import { addNoteToArray, deleteNoteFromArray } from "../utils/noteUtils";
import { API_ENDPOINTS } from "../config/api";
import { authStorage } from "../utils/authStorage";
import { useChatHistory } from "../hooks/useChatHistory";
import { botInstructions } from "./botInfo";
import ChatbotApp from "./ChatbotApp";
import ChatbotIcon from "./ChatbotIcon";
import { Toaster } from "react-hot-toast";
import EmptyState from "./EmptyState";

function App({ onLogout }) {
  const [notes, setNotes] = useState([]);

  // Load notes from backend on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        let token = null;
        try {
          token =
            authStorage && authStorage.getToken ? authStorage.getToken() : null;
        } catch (e) {
          token = null;
        }
        if (!token) token = localStorage.getItem("token");

        const res = await fetch(API_ENDPOINTS.notes.myNotes, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401) {
          console.warn("Pobieranie notatek: Unauthorized");
          onLogout();

          return;
        }

        if (!res.ok) {
          console.warn("Nie udało się pobrać notatek, status:", res.status);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) setNotes(data);
      } catch (err) {
        console.error("Błąd pobierania notatek:", err);
      }
    };

    fetchNotes();
  }, []);

  const {
    chatHistory,
    addMessage,
    addThinkingMessage,
    updateLastMessage,
    visibleMessages,
    clearHistory,
  } = useChatHistory(botInstructions);

  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  // AI response cache to avoid duplicate requests for the same note
  const aiCacheRef = useRef(new Map());

  const handleAddNote = (newNote) =>
    setNotes((prev) => addNoteToArray(prev, newNote));

  // Delete note: call backend then update local state
  const handleDeleteNote = async (id) => {
    try {
      // get token from authStorage or localStorage
      let token = null;
      try {
        token =
          authStorage && authStorage.getToken ? authStorage.getToken() : null;
      } catch (e) {
        token = null;
      }
      if (!token) token = localStorage.getItem("token");

      const res = await fetch(API_ENDPOINTS.notes.deleteNote(id), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        console.warn("Usuwanie notatki: Unauthorized");
        // Optionally: handle logout/redirect
        return;
      }

      if (!res.ok) {
        console.warn("Nie udało się usunąć notatki, status:", res.status);
        return;
      }

      // success -> remove from UI
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Błąd usuwania notatki:", err);
    }
  };

  const sendContentToAI = async (noteData) => {
    const userMessage = `Please advise based on this note ( in note language ):
Title: ${noteData.title}
Content: ${noteData.content}`;

    try {
      // Add user message (hidden in chat view) and show Thinking...
      // hideInChat: true makes the message available in history, but not
      // displayed in `visibleMessages` used for UI rendering.
      addMessage({ role: "user", text: userMessage, hideInChat: true });
      addThinkingMessage();

      // History snapshot (to avoid race conditions)
      const historySnapshot = [
        ...chatHistory,
        { role: "user", text: userMessage },
      ];

      // Call response generation
      await generateBotResponse(historySnapshot);
    } catch (error) {
      // If error occurs before fetch, update model message as error
      updateLastMessage("Wystąpił błąd przy wysyłaniu zapytania do AI", true);
    }
  };

  const generateBotResponse = async (history) => {
    // Format chat history for API request
    const formattedHistory = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
      // Attach Authorization header with user's JWT if available
      try {
        let token = null;
        try {
          token =
            authStorage && authStorage.getToken ? authStorage.getToken() : null;
        } catch (e) {
          token = null;
        }
        if (!token) token = localStorage.getItem("token");
        if (token)
          requestOptions.headers = {
            ...requestOptions.headers,
            Authorization: `Bearer ${token}`,
          };
      } catch (e) {
        // ignore header attach errors
      }

      const response = await fetch(API_ENDPOINTS.ai.chat, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Sprawdzanie struktury odpowiedzi
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Nieprawidłowa struktura odpowiedzi od AI");
      }

      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();

      if (!apiResponseText) {
        throw new Error("AI zwróciło pustą odpowiedź");
      }

      updateLastMessage(apiResponseText);
    } catch (error) {
      console.error("Błąd chatbota:", error);

      // error messages
      let userMessage = "Przepraszam, wystąpił problem. Spróbuj ponownie.";

      if (error.message.includes("Failed to fetch")) {
        userMessage =
          "Brak połączenia z serwerem AI. Sprawdź połączenie internetowe.";
      } else if (error.message.includes("429")) {
        userMessage = "Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie.";
      } else if (
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        userMessage = "Problem z autoryzacją API. Sprawdź klucz API.";
      }

      updateLastMessage(userMessage, true);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  // API call after user msg
  const handleUserMessage = (userMessage) => {
    // dodaj usera i komunikat "Thinking..." do lokalnej historii
    addMessage({ role: "user", text: userMessage });
    addThinkingMessage();

    // Build snapshot and call response generation
    const historySnapshot = [
      ...chatHistory,
      { role: "user", text: userMessage },
    ];
    generateBotResponse(historySnapshot);
  };

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4aed88",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ff4b4b",
              secondary: "#fff",
            },
          },
        }}
      />
      <Header />
      <button className="logout-button" onClick={onLogout}>
        Wyloguj się
      </button>
      <CreateArea onAdd={handleAddNote} showChatbot={showChatbot} />
      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        notes.map((noteItem) => (
          <Note
            key={noteItem.id}
            id={noteItem.id}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={handleDeleteNote}
            setShowChatbot={setShowChatbot}
            sendContentToAI={sendContentToAI}
            created_at={noteItem.created_at}
          />
        ))
      )}
      <ChatbotApp
        generateBotResponse={generateBotResponse}
        chatHistory={chatHistory}
        addMessage={addMessage}
        addThinkingMessage={addThinkingMessage}
        updateLastMessage={updateLastMessage}
        visibleMessages={visibleMessages}
        showChatbot={showChatbot}
        setShowChatbot={setShowChatbot}
        chatBodyRef={chatBodyRef}
        handleUserMessage={handleUserMessage}
        clearHistory={clearHistory}
      />

      <button
        onClick={() => {
          setShowChatbot((prev) => !prev);
        }}
        id="chatbot-toggler-main-page"
        title="Your AI Coach"
      >
        <ChatbotIcon width="40" height="40" fill="#f5ba13" />
      </button>
      <Footer />
    </div>
  );
}

export default App;
