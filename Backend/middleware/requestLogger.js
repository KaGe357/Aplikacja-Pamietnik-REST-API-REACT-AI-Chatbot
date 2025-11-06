import logger from "../config/logger.js";

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request after response finish
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent") || "unknown",
    };

    // Add user ID if available ( after autorization )
    if (req.user && req.user.id) {
      logData.userId = req.user.id;
    }

    // Choose log level according to status code
    if (res.statusCode >= 500) {
      logger.error("HTTP Request", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("HTTP Request", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  });

  next();
};
export default requestLogger;
