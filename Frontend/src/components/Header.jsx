import React from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import ChatbotIcon from "./ChatbotIcon";

function Header() {
  return (
    <header>
      <h1>
        <span className="material-symbols-outlined">auto_stories</span>
        Diary with AI
        <ChatbotIcon width="20" height="20" fill="#fff" />
        Coach
      </h1>
    </header>
  );
}

export default Header;
