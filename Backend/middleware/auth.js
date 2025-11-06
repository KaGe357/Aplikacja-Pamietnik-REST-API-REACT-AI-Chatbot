import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

const authenticateToken = (req, res, next) => {
  // Fetch token from headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    logger.warn("Brak tokenu autoryzacyjnego w żądaniu");
    return res.status(401).json({ msg: "Brak tokenu autoryzacyjnego" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Auth failed: token expired", {
        userId: decoded?.id || "unknown",
        ip: req.ip,
        endpoint: req.originalUrl,
      });
      return res.status(401).json({ msg: "Token wygasł" });
    }
    if (error.name === "JsonWebTokenError") {
      logger.warn("Auth failed: invalid token", {
        ip: req.ip,
        endpoint: req.originalUrl,
      });
      return res.status(403).json({ msg: "Nieprawidłowy token" });
    }
    logger.error("Auth error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    return res.status(500).json({ msg: "Błąd weryfikacji tokenu" });
  }
};

export default authenticateToken;
