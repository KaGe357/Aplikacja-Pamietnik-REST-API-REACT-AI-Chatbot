import React, { useRef, useEffect, useState } from "react";
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

const ChatbotApp = ({
  generateBotResponse,
  chatHistory,
  addMessage,
  addThinkingMessage,
  updateLastMessage,
  visibleMessages,
  showChatbot,
  setShowChatbot,
  chatBodyRef,
  handleUserMessage,
  clearHistory,
}) => {
  return (
    <div
      className={`container ${showChatbot ? "show-chatbot" : ""}`}
      id="chatbot-container"
    >
      <div className="chatbot-popup">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">CoachAI</h2>
          </div>
          <div className="header-buttons">
            <button
              onClick={clearHistory}
              className="material-symbols-outlined"
              title="Clear chat history"
            >
              delete
            </button>
            <button
              onClick={() => setShowChatbot((prev) => !prev)}
              className="material-symbols-outlined"
            >
              keyboard_arrow_down
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hello there ! <br /> How can I help you today?
            </p>
          </div>

          {/* Render chat history */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Chat Footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            addMessage={addMessage}
            addThinkingMessage={addThinkingMessage}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatbotApp;
