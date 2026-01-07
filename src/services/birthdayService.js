const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const BIRTHDAY_FILE = path.join(DATA_DIR, 'birthdays.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure birthday file exists
if (!fs.existsSync(BIRTHDAY_FILE)) {
    fs.writeFileSync(BIRTHDAY_FILE, JSON.stringify({}));
}

function getBirthdays() {
    try {
        const data = fs.readFileSync(BIRTHDAY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading birthdays:", error);
        return {};
    }
}

function saveBirthdays(data) {
    try {
        fs.writeFileSync(BIRTHDAY_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving birthdays:", error);
    }
}

/**
 * Set a user's birthday
 * @param {string} userId
 * @param {number} day
 * @param {number} month (1-12)
 */
function setBirthday(userId, day, month) {
    const birthdays = getBirthdays();
    birthdays[userId] = { day, month };
    saveBirthdays(birthdays);
}

/**
 * Get a user's birthday
 * @param {string} userId
 * @returns {object|null} { day, month } or null
 */
function getBirthday(userId) {
    const birthdays = getBirthdays();
    return birthdays[userId] || null;
}

/**
 * Get all users with a birthday today
 * @returns {string[]} Array of user IDs
 */
function getTodaysBirthdays() {
    const birthdays = getBirthdays();
    const today = new Date();
    // Using local date might be tricky with timezone, generally better to use UTC or specific timezone
    // For now, let's assume the bot runs in the target timezone or just use generic Date methods
    // We will use standard getMonth() (0-indexed) + 1 and getDate()

    // Note: The Metadata says user is +06:00. 
    // Ideally we'd handle timezones per user, but for a simple bot, bot's local time is usually accepted.

    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;

    const userIds = [];
    for (const [userId, date] of Object.entries(birthdays)) {
        if (date.day === currentDay && date.month === currentMonth) {
            userIds.push(userId);
        } // No timezone logic yet, relying on system time
    }
    return userIds;
}

module.exports = {
    setBirthday,
    getBirthday,
    getTodaysBirthdays
};
