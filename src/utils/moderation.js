const badWords = ['badword1', 'badword2']; // Example list

function containsBadWords(text) {
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
}

function isSafeContent(text) {
    // Implement more complex checks here (e.g., OpenAI moderation API)
    return !containsBadWords(text);
}

module.exports = { isSafeContent };
