import React from "react";

function AuthForm({
  isLogin,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleSubmit,
  message,
  validPassword,
}) {
  const handlePasswordChange = (value) => {
    setPassword(value);
  };

  const handleConfirmChange = (value) => {
    setConfirmPassword(value);
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Logowanie" : "Rejestracja"}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Potwierdź hasło"
            value={confirmPassword}
            onChange={(e) => handleConfirmChange(e.target.value)}
            required
          />
        )}
        <button type="submit" className="auth-button">
          {isLogin ? "Zaloguj sie" : "Zarejestruj sie"}
        </button>
      </form>

      {!isLogin && validPassword && (
        <p className="auth-success">✅ Hasła są poprawne</p>
      )}

      {message && <p className="auth-message">{message}</p>}
    </div>
  );
}

export default AuthForm;
