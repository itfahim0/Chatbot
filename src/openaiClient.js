const OpenAI = require("openai");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getChatResponse(messages, imageUrl = null) {
    try {
        // If an image URL is provided, we need to format the last user message to include the image
        let finalMessages = [...messages];

        if (imageUrl) {
            const lastMessageIndex = finalMessages.length - 1;
            const lastMessage = finalMessages[lastMessageIndex];

            if (lastMessage.role === 'user') {
                finalMessages[lastMessageIndex] = {
                    role: 'user',
                    content: [
                        { type: "text", text: lastMessage.content },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageUrl,
                            },
                        },
                    ],
                };
            }
        }

        // We rely on the caller to provide the system prompt in the messages array
        const completion = await openai.chat.completions.create({
            messages: finalMessages,
            model: "gpt-4o-mini", // Supports vision
            max_tokens: 1500,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "দুঃখিত বন্ধু, আমার মস্তিষ্কে একটু সমস্যা হচ্ছে। পরে আবার চেষ্টা করো!";
    }
}

async function transcribeAudio(audioUrl) {
    try {
        const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });

        // Determine extension from URL or default to .mp3
        const extension = path.extname(audioUrl).split('?')[0] || '.mp3';
        const tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}${extension}`);

        fs.writeFileSync(tempFilePath, response.data);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
            language: "bn", // Hint for Bengali
        });

        fs.unlinkSync(tempFilePath); // Cleanup
        return transcription.text;
    } catch (error) {
        console.error("Audio Transcription Error:", error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { getChatResponse, transcribeAudio };
