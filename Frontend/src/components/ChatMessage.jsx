import ChatbotIcon from "./ChatbotIcon";
import {LoadingDots} from "./LoadingDots";

const ChatMessage = ({chat}) => {
    return (
        !chat.hideInChat && 
        (<div className={`message ${chat.role === "model" ? "bot" : "user"}-message ${chat.isError ? "error" : ""}`}>
          {chat.role === "model" && <ChatbotIcon />}
          {chat.text === "Thinking..." ? ( 
            <LoadingDots /> 
          ) : (
          <p className="message-text">{chat.text}</p>
          )}
          </div>)
    )
}


export default ChatMessage;