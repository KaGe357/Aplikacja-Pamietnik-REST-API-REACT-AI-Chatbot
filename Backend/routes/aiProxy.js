import express from "express";
import logger from "../config/logger.js";

const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));
const router = express.Router();

// Note: authentication is applied in server.js when mounting this router.
router.post("/chat", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ error: "No body" });

    const apiKey = process.env.AI_API_KEY;
    const providerUrl = process.env.AI_PROVIDER_URL;
    if (!apiKey || !providerUrl) {
      logger.error(
        "AI proxy misconfiguration: missing API_KEY or PROVIDER_URL"
      );
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const headers = { "Content-Type": "application/json" };
    let url = providerUrl;

    // If providerUrl contains a query key parameter ending with '=' we append
    // the key (e.g. ...?key=). If it already contains a key value, we leave it.
    if (providerUrl.includes("key=") && providerUrl.trim().endsWith("=")) {
      url = `${providerUrl}${encodeURIComponent(apiKey)}`;
    } else if (!providerUrl.includes("key=")) {
      // Otherwise, pass API key in Authorization header
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const startTime = Date.now();

    const apiResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    // Po wykonaniu fetch:
    logger.info("AI request sent", {
      userId: req.user.id,
      providerUrl: logger.maskSensitive(url),
      payloadSize: JSON.stringify(payload).length,
    });

    // Read text for logging/debugging (we'll attempt to parse JSON after)
    const responseText = await apiResponse.text().catch(() => "");
    let parsedResponse = null;
    const contentType = apiResponse.headers.get("content-type") || "";

    try {
      parsedResponse = JSON.parse(responseText);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // not JSON - will be handled below
    }

    logger.info("AI response received", {
      userId: req.user.id,
      status: apiResponse.status,
      duration: `${Date.now() - startTime}ms`,
      responseSize: responseText.length,
      contentType: contentType,
    });

    // If parse failed:
    if (contentType.includes("application/json") && !parsedResponse) {
      logger.warn("AI response JSON parse failed", {
        userId: req.user.id,
        snippet: responseText.slice(0, 200),
      });
    }

    // If provider returned an error:
    if (parsedResponse && parsedResponse.error) {
      logger.warn("AI provider error", {
        userId: req.user?.id,
        error: JSON.stringify(parsedResponse.error).slice(0, 300),
      });
    }

    return res
      .status(apiResponse.status || 200)
      .json(parsedResponse || { raw: responseText });
  } catch (error) {
    logger.error("AI proxy error", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });
    return res.status(500).json({ error: "Proxy error" });
  }
});

export default router;
