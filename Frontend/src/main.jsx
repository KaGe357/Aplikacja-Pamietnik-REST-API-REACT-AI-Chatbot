import React, { useState } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import Auth from "./components/Auth";
import "./styles.css";
import { createRoot } from "react-dom/client";


function Main() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLoginSuccess = (jwt) => {
    localStorage.setItem("token", jwt); 
    setToken(jwt);
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return token ? (
    <App onLogout={handleLogout} />
  ) : (
    <Auth onLoginSuccess={handleLoginSuccess} />
  );
}


const container = document.getElementById("root");
const root = createRoot(container); 
root.render(<Main />);

