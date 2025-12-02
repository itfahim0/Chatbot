const { ChannelType } = require('discord.js');

/**
 * Generates a formatted string containing server context information.
 * @param {import('discord.js').Guild} guild 
 * @returns {Promise<string>}
 */
async function getServerContext(guild) {
    if (!guild) return "";

    try {
        // 1. Fetch all members to ensure cache is populated (for admin check)
        await guild.members.fetch();

        // 2. Channels
        const channels = guild.channels.cache
            .filter(c => c.type === ChannelType.GuildText)
            .map(c => {
                let info = `- ${c.name} (ID: ${c.id})`;
                if (c.topic) info += ` [Desc: ${c.topic.substring(0, 100)}]`;
                return info;
            })
            .slice(0, 50) // Limit to avoid hitting token limits
            .join("\n");

        // 3. Roles
        const roles = guild.roles.cache
            .sort((a, b) => b.position - a.position) // High rank first
            .map(r => `- ${r.name} (ID: ${r.id})`)
            .slice(0, 30)
            .join("\n");

        // 4. Admins & Key People
        const admins = guild.members.cache
            .filter(m => m.permissions.has('Administrator') && !m.user.bot)
            .map(m => `- ${m.user.username} (Display: ${m.displayName})`)
            .join("\n");

        // 5. Server Stats
        const stats = `Server Name: ${guild.name}\nTotal Members: ${guild.memberCount}\nCreated At: ${guild.createdAt.toDateString()}`;

        // Construct the final string
        let context = `\n=== SERVER CONTEXT ===\n`;
        context += `${stats}\n\n`;
        context += `--- ADMINS (Key People) ---\n${admins}\n\n`;
        context += `--- CHANNELS ---\n${channels}\n\n`;
        context += `--- ROLES ---\n${roles}\n`;
        context += `======================\n`;

        return context;

    } catch (error) {
        console.error("Error generating server context:", error);
        return "Error fetching server context.";
    }
}

module.exports = { getServerContext };
