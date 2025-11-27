const { Events } = require('discord.js');
const { getChatResponse } = require('../openaiClient');
const knowledgeBase = require('../services/knowledgeBase');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Check if the bot is mentioned or if it's a DM
        const isMentioned = message.mentions.users.has(message.client.user.id);
        const isDM = !message.guild;

        if (isMentioned || isDM) {
            try {
                await message.channel.sendTyping();

                const userMessage = message.content.replace(/<@!?[0-9]+>/g, '').trim();

                // Search knowledge base
                const contextResults = await knowledgeBase.search(userMessage);
                let contextText = "";

                if (contextResults.length > 0) {
                    contextText = contextResults.map(r => r.text).join("\n\n");
                    console.log(`Found ${contextResults.length} relevant context chunks.`);
                }

                // Construct message history
                const messages = [];

                if (contextText) {
                    messages.push({
                        role: "system",
                        content: `Context information is below.\n---------------------\n${contextText}\n---------------------\nGiven the context information and not prior knowledge, answer the query.`
                    });
                }

                messages.push({ role: "user", content: userMessage });

                const response = await getChatResponse(messages);

                // Split long messages if necessary (Discord limit is 2000 chars)
                if (response.length > 2000) {
                    const chunks = response.match(/[\s\S]{1,2000}/g) || [];
                    for (const chunk of chunks) {
                        await message.reply(chunk);
                    }
                } else {
                    await message.reply(response);
                }

            } catch (error) {
                console.error("Error handling message:", error);
                await message.reply("দুঃখিত, একটি সমস্যা হয়েছে।");
            }
        }
    },
};
