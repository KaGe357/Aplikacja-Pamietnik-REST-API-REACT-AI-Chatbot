export const validateRegistration = (req, res, next) => {
  const { username, password } = req.body;

  const passwordMinLength = 8;
  const passwordMaxLength = 64;

  // Validate username
  if (!username || typeof username !== "string") {
    return res.status(400).json({ msg: "Nazwa użytkownika jest wymagana" });
  }

  if (username.length < 3 || username.length > 16) {
    return res.status(400).json({
      msg: "Nazwa użytkownika musi mieć od 3 do 16 znaków",
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      msg: "Nazwa użytkownika może zawierać tylko litery, cyfry i podkreślenia",
    });
  }

  // Validate password
  if (!password || typeof password !== "string") {
    return res.status(400).json({ msg: "Hasło jest wymagane" });
  }

  if (password.length < passwordMinLength) {
    return res.status(400).json({
      msg: `Hasło musi mieć minimum ${passwordMinLength} znaków`,
    });
  }

  if (password.length > passwordMaxLength) {
    return res.status(400).json({
      msg: "Hasło jest za długie",
    });
  }

  // At least one digit
  if (!/\d/.test(password)) {
    return res.status(400).json({
      msg: "Hasło musi zawierać co najmniej 1 cyfrę",
    });
  }

  // At least one special character
  if (!/[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]/.test(password)) {
    return res.status(400).json({
      msg: "Hasło musi zawierać co najmniej 1 znak specjalny (!@#$%^&* itp.)",
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Wszystkie pola są wymagane" });
  }

  next();
};
