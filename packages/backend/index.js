const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { paymentMiddleware } = require('x402-express');

// --- Configuration ---
const app = express();
const port = 3001;
const { GOOGLE_API_KEY, PAY_TO_ADDRESS } = process.env;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

app.use(cors());
app.use(express.json());

// --- Main Conversational AI (Free Endpoint) ---
app.post('/api/command', async (req, res) => {
  const { message } = req.body;
  console.log("Received conversational query:", message);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are DeFiGenie, an AI financial assistant. Provide a helpful, conversational response. Use Markdown. For financial talk, add the disclaimer: "Disclaimer: This is not financial advice." User Command: "${message}"`;

  try {
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.json({ reply: "I'm having trouble connecting to my knowledge base right now." });
  }
});

// --- x402 Protected Endpoint (Paid) ---
// The middleware protects only this specific endpoint.
app.post('/api/x402-test', 
    paymentMiddleware(
        PAY_TO_ADDRESS, 
        { "/api/x402-test": "$0.01" },
        { facilitatorUrl: "https://x402.org/facilitator" }
    ), 
    (req, res) => {
        console.log("✅ x402 Payment successful!");
        res.json({ reply: "✅ **x402 Payment Successful!**\n\nThis confirms that the payment gateway is working correctly." });
    }
);

app.listen(port, () => {
  console.log(`DeFiGenie Backend listening at http://localhost:${port}`);
});