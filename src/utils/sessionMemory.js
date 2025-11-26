const sessions = new Map();

function getSession(userId) {
    if (!sessions.has(userId)) {
        sessions.set(userId, []);
    }
    return sessions.get(userId);
}

function addMessageToSession(userId, message) {
    const session = getSession(userId);
    session.push(message);
    // Keep only last 10 messages to save memory
    if (session.length > 10) {
        session.shift();
    }
}

function clearSession(userId) {
    sessions.delete(userId);
}

module.exports = { getSession, addMessageToSession, clearSession };
