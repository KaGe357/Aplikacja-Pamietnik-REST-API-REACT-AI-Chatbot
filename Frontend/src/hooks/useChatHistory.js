import { useState, useCallback, useMemo, useEffect } from "react";

const CHAT_STORAGE_KEY = "chatbot_history";

export const useChatHistory = (initialInstructions) => {
  // Load from localStorage or use default
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }

    // Default history
    return [
      {
        hideInChat: true,
        role: "model",
        text: initialInstructions,
      },
    ];
  });

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [chatHistory]);

  const addMessage = useCallback((message) => {
    setChatHistory((prev) => [...prev, message]);
  }, []);

  const addThinkingMessage = useCallback(() => {
    setChatHistory((prev) => [...prev, { role: "model", text: "Thinking..." }]);
  }, []);

  const removeThinkingMessage = useCallback(() => {
    setChatHistory((prev) => prev.filter((msg) => msg.text !== "Thinking..."));
  }, []);

  const updateLastMessage = useCallback((text, isError = false) => {
    setChatHistory((prev) => {
      const filtered = prev.filter((msg) => msg.text !== "Thinking...");
      return [...filtered, { role: "model", text, isError }];
    });
  }, []);

  // Clear chat history
  const clearHistory = useCallback(() => {
    const defaultHistory = [
      {
        hideInChat: true,
        role: "model",
        text: initialInstructions,
      },
    ];
    setChatHistory(defaultHistory);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }, [initialInstructions]);

  // Memoize visible messages
  const visibleMessages = useMemo(
    () => chatHistory.filter((msg) => !msg.hideInChat),
    [chatHistory]
  );

  return {
    chatHistory,
    setChatHistory,
    addMessage,
    addThinkingMessage,
    removeThinkingMessage,
    updateLastMessage,
    visibleMessages,
    clearHistory,
  };
};
