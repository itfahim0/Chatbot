const { Events } = require('discord.js');
const { getChatResponse } = require('../geminiClient');

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

                // Construct message history (simple version: just the current message)
                // In a real app, you'd fetch previous messages for context
                const messages = [
                    { role: "user", content: message.content.replace(/<@!?[0-9]+>/g, '').trim() }
                ];

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
