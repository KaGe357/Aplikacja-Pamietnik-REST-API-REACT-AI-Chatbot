import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import "../ChatbotStyles.css";
import { addNoteToArray, deleteNoteFromArray } from '../utils/noteUtils';
import { botInstructions } from './botInfo';
import ChatbotApp from "./ChatbotApp";


function App({ onLogout }) {
  const [notes, setNotes] = useState([]);

   const [chatHistory, setChatHistory] = useState([
    {
    hideInChat: true,
    role: "model",
    text: botInstructions,
  },
]);
  const [showChatbot, setShowChatbot] = useState(false);
   const chatBodyRef = useRef();

  const handleAddNote = (newNote) => setNotes(prev => addNoteToArray(prev, newNote));
  const handleDeleteNote = (id) => setNotes(prev => deleteNoteFromArray(prev, id));


  const sendContentToAI = async(noteData) => {
 
  const userMessage = `Please advise based on this note ( in a note language ):
Title: ${noteData.title}
Content: ${noteData.content}`;

 try {
  setChatHistory(prev => [...prev, { role: "model", text: "Thinking..." }]);

    await generateBotResponse([{ role: "user", text: userMessage }]);
    
  } catch (error) {
    console.error(error);
  }
};

const generateBotResponse = async (history) => {
    // Helper function to update chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), {role: "model", text, isError}]);
    }
    // Format chat history for API request
    history = history.map(({role, text}) => ({role, parts: [{text}]}));

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: history}) 
    };

    try{
      // MAKE API CALL TO GET BOTS RESPONSE
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions );
      const data = await response.json();
      if(!response.ok) throw new Error(data.error.message || "Something went wrong!");

      const apiResonseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
      updateHistory(apiResonseText);
    } 
    catch (error) {
            updateHistory(error.message, true);

    }
  };



   // Scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory]);

  // API call after user msg
  const handleUserMessage = (userMessage) => {
    setChatHistory(prev => [...prev, { role: "user", text: userMessage }]);
    setChatHistory(prev => [...prev, { role: "model", text: "Thinking..." }]);
    generateBotResponse([...chatHistory, { role: "user", text: userMessage }], setChatHistory);
  };


  return (
    <div className="app-container">
      <Header />
      <button className="logout-button" onClick={onLogout}>
        Wyloguj się
      </button>
      <CreateArea onAdd={handleAddNote} showChatbot={showChatbot} />
      {notes.map((noteItem, index) => (
        <Note
          key={index}
          id={index}
          title={noteItem.title}
          content={noteItem.content}
          onDelete={handleDeleteNote}
          setShowChatbot={setShowChatbot}
          sendContentToAI={sendContentToAI}
        />
      ))}
      <ChatbotApp generateBotResponse={generateBotResponse} chatHistory={chatHistory} setChatHistory={setChatHistory} showChatbot={showChatbot} setShowChatbot={setShowChatbot} chatBodyRef={chatBodyRef} handleUserMessage={handleUserMessage} />

      <Footer />
    </div>
  );
}

export default App;
