const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Performs a web search and returns a list of results.
 * Uses DuckDuckGo HTML version to avoid API keys.
 * @param {string} query
 * @returns {Promise<Array<{title: string, link: string, snippet: string}>>}
 */
async function webSearch(query) {
    try {
        const response = await axios.get('https://html.duckduckgo.com/html/', {
            params: { q: query },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        $('.result').each((index, element) => {
            if (index >= 5) return; // Limit to 5 results

            const title = $(element).find('.result__title').text().trim();
            const link = $(element).find('.result__a').attr('href');
            const snippet = $(element).find('.result__snippet').text().trim();

            if (title && link) {
                results.push({
                    title,
                    link,
                    snippet
                });
            }
        });

        return results;

    } catch (error) {
        console.error('Web Search Error:', error.message);
        return [];
    }
}

module.exports = { webSearch };
