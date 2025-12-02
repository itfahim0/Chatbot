const knowledgeBase = require('./knowledgeBase');
const { ChannelType } = require('discord.js');

/**
 * Ingests history from a single channel.
 * @param {import('discord.js').TextChannel} channel 
 * @param {number} limit Max messages to fetch (default 500 to be safe, can be higher)
 */
async function ingestChannelHistory(channel, limit = 500) {
    if (!channel.isTextBased()) return;

    console.log(`Starting history ingestion for #${channel.name}...`);
    let count = 0;
    let lastId;

    try {
        while (count < limit) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) break;

            for (const msg of messages.values()) {
                if (!msg.author.bot && msg.content.length > 5) {
                    await knowledgeBase.addChatLog(msg);
                }
                lastId = msg.id;
                count++;
            }

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log(`Finished #${channel.name}: Processed ${count} messages.`);
        return count;
    } catch (error) {
        console.error(`Error ingesting #${channel.name}:`, error);
        return 0;
    }
}

/**
 * Ingests history from all text channels in the guild.
 * @param {import('discord.js').Guild} guild 
 */
async function ingestGuildHistory(guild) {
    console.log(`Starting full server ingestion for ${guild.name}...`);

    const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
    let totalMessages = 0;

    for (const channel of channels.values()) {
        const count = await ingestChannelHistory(channel);
        totalMessages += count;
    }

    console.log(`Full server ingestion complete. Total messages: ${totalMessages}`);
    return totalMessages;
}

module.exports = { ingestChannelHistory, ingestGuildHistory };
