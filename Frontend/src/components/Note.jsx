import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatbotIcon from "./ChatbotIcon";
import toast from "react-hot-toast";

function Note(props) {
  function handleDelete() {
    if (window.confirm("Czy na pewno chcesz usunąć tę notatkę?")) {
      props.onDelete(props.id);
    }
    toast.success("Usunięto.");
  }
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="note ">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
      <div className="note-footer">
        {props.created_at && (
          <span className="note-timestamp">
            📅 {formatDate(props.created_at)}
          </span>
        )}
        <div className="note-buttons">
          <button
            onClick={() => {
              props.setShowChatbot((prev) => !prev);
              if (props.showChatbot == false) {
                props.sendContentToAI({
                  title: props.title,
                  content: props.content,
                });
              }
            }}
            id="chatbot-toggler"
            title="Ask your AI Coach"
          >
            <ChatbotIcon width="30" height="30" fill="#f5ba13" />
          </button>
          <button onClick={handleDelete} title="Delete note">
            <DeleteIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Note;
