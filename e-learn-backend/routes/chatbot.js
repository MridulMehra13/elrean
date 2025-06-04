const express = require("express");
const router = express.Router();
const axios = require("axios");
const Chatbot = require("../models/chatbotModel");

router.post("/", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const cohereRes = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command-nightly",
        prompt: `Answer this as a teacher: ${userMessage}`,
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const botResponse = cohereRes.data.generations?.[0]?.text?.trim() || "Sorry, I couldn't generate a response.";

    await Chatbot.create({ userMessage, botResponse });

    res.json({ response: botResponse });
  } catch (error) {
    console.error("❌ Cohere API Error:", error?.response?.data || error.message);
    const errorMessage = error?.response?.data?.message || "Failed to get a response from Cohere";
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;
