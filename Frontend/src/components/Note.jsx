import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatbotIcon from './ChatbotIcon';

function Note(props) {
  function handleDelete() {
    props.onDelete(props.id);
  }

  return (
    <div className="note ">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
        <div className="note-buttons">
      <button onClick={() => {
        props.setShowChatbot(prev => !prev )
        props.sendContentToAI({title: props.title, content: props.content})
        }
        } id="chatbot-toggler" title="Ask your AI Coach">
        <ChatbotIcon width="30" height="30" fill="#f5ba13" />
      </button>
      <button onClick={handleDelete} title="Delete note">
        <DeleteIcon />
      </button>
      </div>
    </div>
  );
}

export default Note;
