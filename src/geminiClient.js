const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const systemPrompt = require('./systemPrompt');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getChatResponse(messages) {
    try {
        // For Gemini, we need to format messages differently or use the chat model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "ঠিক আছে বন্ধু! আমি প্রস্তুত। আমি এখন থেকে তোমার নির্দেশ মেনে চলব।" }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        // Get the last user message
        const lastMessage = messages[messages.length - 1].content;

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "দুঃখিত বন্ধু, আমার মস্তিষ্কে একটু সমস্যা হচ্ছে। পরে আবার চেষ্টা করো!";
    }
}

module.exports = { getChatResponse };
