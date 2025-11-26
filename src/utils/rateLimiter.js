const rateLimits = new Map();

function checkRateLimit(userId, limit = 5, windowMs = 60000) {
    const now = Date.now();
    if (!rateLimits.has(userId)) {
        rateLimits.set(userId, []);
    }

    const timestamps = rateLimits.get(userId);
    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    rateLimits.set(userId, validTimestamps);

    if (validTimestamps.length >= limit) {
        return false; // Rate limit exceeded
    }

    validTimestamps.push(now);
    return true; // Allowed
}

module.exports = { checkRateLimit };
