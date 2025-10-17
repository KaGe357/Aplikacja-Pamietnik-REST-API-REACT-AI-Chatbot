import React from "react";
import AuthForm from "./AuthForm";

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [validPassword, setValidPassword] = React.useState(false);

  const validatePassword = () => {
    if (!isLogin) {
      if (password.length < 6) return "❌ Hasło musi mieć minimum 6 znaków";
      if (password !== confirmPassword) return "❌ Hasła nie są takie same";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validatePassword();
    if (error) {
      setMessage(error);
      setValidPassword(false);
      return;
    }
    setMessage("");
    setValidPassword(true);

    const endpoint = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setMessage("✅ Logowanie udane");
          onLoginSuccess(data.token);
        } else {
          setMessage("✅ Rejestracja udana. Teraz możesz się zalogować.");
          setIsLogin(true);
          setPassword("");
          setConfirmPassword("");
          setValidPassword(false);
        }
      } else {
        setMessage(`❌ ${data.msg}`);
      }
    } catch (error) {
      console.error("Błąd:", error);
      setMessage("❌ Błąd serwera");
    }
  };

  React.useEffect(() => {
    if (!isLogin) {
      const err = validatePassword();
      setMessage(err);
      setValidPassword(!err);
    } else {
      setMessage("");
      setValidPassword(false);
    }
  }, [password, confirmPassword, isLogin]);

  return (
    <div className="auth-page">
      <div className="auth-box">
        <AuthForm
          isLogin={isLogin}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          handleSubmit={handleSubmit}
          message={message}
          validPassword={validPassword}
        />
        <p className="auth-toggle">
          {isLogin ? "Nie masz konta?" : "Masz już konto?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
