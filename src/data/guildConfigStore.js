const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config/guilds.json');

// Ensure file exists
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}));
}

function getGuildConfig(guildId) {
    const data = fs.readFileSync(configPath);
    const configs = JSON.parse(data);
    return configs[guildId] || {};
}

function setGuildConfig(guildId, config) {
    const data = fs.readFileSync(configPath);
    const configs = JSON.parse(data);
    configs[guildId] = { ...configs[guildId], ...config };
    fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
}

module.exports = { getGuildConfig, setGuildConfig };
