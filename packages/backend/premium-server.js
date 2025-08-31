const express = require('express');
const { paymentMiddleware } = require('x402-express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = 4021; // The port for our premium service
const { PAY_TO_ADDRESS, GOOGLE_API_KEY } = process.env;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

app.use(require('cors')());
app.use(express.json());

// This middleware protects our endpoint, requiring a 0.01 USDC payment
app.use(paymentMiddleware(
    PAY_TO_ADDRESS,
    { "POST /premium-ai": { price: "$0.01", network: "base-sepolia" } },
    { url: "https://x402.org/facilitator" } // The public testnet facilitator
));

// This route will only be accessible after a successful x402 payment
app.post("/premium-ai", async (req, res) => {
    const { message } = req.body;
    console.log(`Premium AI server received paid prompt: ${message}`);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are DeFiGenie, an AI financial assistant. Provide a helpful, conversational response to the following query. Use Markdown for formatting. Include the disclaimer "Disclaimer: This is not financial advice." User Command: "${message}"`;

    try {
        const result = await model.generateContent(prompt);
        res.send({ reply: result.response.text() });
    } catch(e) {
        res.status(500).send({ reply: "There was an error processing your request with the AI." });
    }
});

app.listen(port, () => {
    console.log(`Premium AI Seller listening at http://localhost:${port}`);
});