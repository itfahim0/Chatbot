const { Events, ActivityType } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        // --- Dynamic Status Logic ---
        const cities = [
            { name: 'Dhaka', lat: 23.8103, lon: 90.4125 },
            { name: 'Chittagong', lat: 22.3569, lon: 91.7832 },
            { name: 'Sylhet', lat: 24.8949, lon: 91.8687 },
            { name: 'Khulna', lat: 22.8456, lon: 89.5403 },
            { name: 'Rajshahi', lat: 24.3636, lon: 88.6241 },
            { name: 'Barisal', lat: 22.7010, lon: 90.3535 },
            { name: 'Comilla', lat: 23.4607, lon: 91.1809 },
            { name: 'Mymensingh', lat: 24.7471, lon: 90.4203 },
            { name: 'Rangpur', lat: 25.7439, lon: 89.2752 }
        ];

        let currentCityIndex = 0;

        const updateStatus = async () => {
            try {
                const city = cities[currentCityIndex];
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,wind_speed_10m&timezone=auto`;

                const response = await axios.get(url);
                const temp = response.data.current.temperature_2m;
                const wind = response.data.current.wind_speed_10m;

                // Status Format: "Dhaka: 32°C, 12km/h"
                const statusText = `${city.name}: ${temp}°C, ${wind}km/h`;

                client.user.setActivity(statusText, { type: ActivityType.Watching });

                // Rotate to next city
                currentCityIndex = (currentCityIndex + 1) % cities.length;

            } catch (error) {
                console.error("Error fetching weather:", error.message);
                // Fallback status if weather fails
                client.user.setActivity('with code | !help', { type: ActivityType.Playing });
            }
        };

        // Initial call
        updateStatus();

        // Update every 10 seconds
        setInterval(updateStatus, 10000);

        // Limit concurrent ingestion if needed, or keep it as is
        // Trigger document ingestion
        const { ingestAll } = require('../services/documentIngestion');
        await ingestAll();

        // --- Birthday Checker ---
        const { getTodaysBirthdays } = require('../services/birthdayService');

        const checkBirthdays = async () => {
            console.log("Checking for birthdays...");
            const birthdays = getTodaysBirthdays();

            if (birthdays.length > 0) {
                // Find a channel to send wishes (e.g., 'announcements', 'general', 'birthdays', or system channel)
                // We iterate over all guilds the bot is in (since birthday file is currently global/simple)
                // TODO: Make birthdays guild-specific in future if needed. For now, assume user is in the main guild.

                for (const guild of client.guilds.cache.values()) {
                    // Try to find a suitable channel
                    const channel = guild.channels.cache.find(c => c.name.includes('birthday') || c.name.includes('general') || c.name.includes('chat')) || guild.systemChannel;

                    if (channel && channel.isTextBased()) {
                        for (const userId of birthdays) {
                            // Check if user is in this guild
                            try {
                                const member = await guild.members.fetch(userId);
                                if (member) {
                                    channel.send(`🎉 Happy Birthday to our amazing friend, ${member}! 🎂🎈 Hope you have a fantastic day! 🥳`);
                                }
                            } catch (e) {
                                // User probably not in this guild, ignore
                            }
                        }
                    }
                }
            }
        };

        // Run immediately on startup (for testing/safety)
        checkBirthdays();

        // Run every 12 hours (43200000 ms)
        setInterval(checkBirthdays, 43200000);
    },
};
