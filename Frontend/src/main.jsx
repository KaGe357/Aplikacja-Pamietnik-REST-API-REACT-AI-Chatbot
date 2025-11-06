import React, { useState } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import Auth from "./components/Auth";
import "./styles.css";
import { createRoot } from "react-dom/client";
import { authStorage } from "./utils/authStorage";

function Main() {
  const [token, setToken] = useState(authStorage.getToken() || null);

  const handleLoginSuccess = (jwt) => {
    authStorage.setToken(jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    authStorage.removeToken();
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
