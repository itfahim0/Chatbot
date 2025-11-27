const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('with code | !help');

        // Trigger document ingestion
        const { ingestAll } = require('../services/documentIngestion');
        await ingestAll();
    },
};
