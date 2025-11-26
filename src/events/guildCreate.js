const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    execute(guild) {
        console.log(`Joined a new guild: ${guild.name}`);
        // Optional: Send a welcome message to the system channel or default channel
    },
};
