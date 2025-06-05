const express = require("express");
const router = express.Router();
const axios = require("axios");
const Chatbot = require("../models/chatbotModel"); // Assuming you have this model for saving history

router.post("/", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // ⭐ CHANGE 1: Change API endpoint to /v1/chat ⭐
    const cohereRes = await axios.post(
      "https://api.cohere.ai/v1/chat", // Changed from /v1/generate
      {
        model: "command-nightly",
        // ⭐ CHANGE 2: Use 'message' and 'preamble' instead of 'prompt' ⭐
        // The 'chat' endpoint uses a 'message' field for the current user input.
        message: userMessage,
        // 'preamble' is a good way to set the chatbot's persona (like "as a teacher").
        preamble: "You are a helpful and knowledgeable teacher. Always answer questions in a clear and educational manner.",
        max_tokens: 300,
        temperature: 0.7
        // For multi-turn conversations, you would also pass a 'chat_history' array here.
        // chat_history: [{ role: "USER", message: "Hello" }, { role: "CHATBOT", message: "Hi!" }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // ⭐ CHANGE 3: Adjust how to extract the bot response ⭐
    // For the /v1/chat endpoint, the main generated text is directly in 'cohereRes.data.text'
    const botResponse = cohereRes.data.text?.trim() || "Sorry, I couldn't generate a response.";

    // Save the conversation history (assuming your Chatbot model supports this)
    await Chatbot.create({ userMessage, botResponse });

    res.json({ response: botResponse });
  } catch (error) {
    console.error("❌ Cohere API Error:", error?.response?.data || error.message);
    const errorMessage = error?.response?.data?.message || "Failed to get a response from Cohere";
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;