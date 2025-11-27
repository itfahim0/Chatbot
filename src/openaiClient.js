const OpenAI = require("openai");
require('dotenv').config();
const systemPrompt = require('./systemPrompt');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getChatResponse(messages) {
    try {
        const conversation = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        const completion = await openai.chat.completions.create({
            messages: conversation,
            model: "gpt-4o-mini", // Using a cost-effective and capable model
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "দুঃখিত বন্ধু, আমার মস্তিষ্কে একটু সমস্যা হচ্ছে। পরে আবার চেষ্টা করো!";
    }
}

module.exports = { getChatResponse };
