import React, { useRef } from "react";

const ChatForm = ({
  chatHistory,
  addMessage,
  addThinkingMessage,
  generateBotResponse,
}) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();

    if (!userMessage) return;
    inputRef.current.value = "";

    // add user's message via helper
    addMessage({ role: "user", text: userMessage });

    // add "Thinking..." after small delay to make UI feel responsive
    setTimeout(() => {
      addThinkingMessage();

      // build snapshot to avoid race with state updates
      const historySnapshot = [
        ...chatHistory,
        { role: "user", text: userMessage },
      ];

      // Call function to generate bot response
      generateBotResponse(historySnapshot);
    }, 200);
  };

  return (
    <form action="" className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button className="material-symbols-outlined">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
