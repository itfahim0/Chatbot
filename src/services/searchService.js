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
        console.log(`Searching for: ${query}`);
        const response = await axios.get('https://html.duckduckgo.com/html/', {
            params: { q: query },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://html.duckduckgo.com/'
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

        console.log(`Found ${results.length} results for: ${query}`);
        return results;

    } catch (error) {
        console.error('Web Search Error:', error.message);
        // Fallback: Return empty array so logic doesn't break
        return [];
    }
}

/**
 * Fetches the content of a web page and returns a clean text summary.
 * @param {string} url 
 * @returns {Promise<string>}
 */
async function readPage(url) {
    try {
        console.log(`Reading page: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 5000 // 5s timeout to prevent hanging
        });

        const $ = cheerio.load(response.data);

        // Remove script, style, and navigation elements to clean up text
        $('script, style, nav, footer, header').remove();

        // Extract paragraphs
        let text = "";
        $('p').each((i, el) => {
            text += $(el).text().trim() + "\n\n";
        });

        // If paragraphs are empty, try body text
        if (!text.trim()) {
            text = $('body').text().replace(/\s+/g, ' ').trim();
        }

        // Truncate to avoid token limits (approx 5000 chars)
        const truncated = text.substring(0, 5000);
        return truncated || "Could not extract meaningful text.";

    } catch (error) {
        console.error(`Error reading page ${url}:`, error.message);
        return "Failed to read the page content. It might be blocked or unavailable.";
    }
}

module.exports = { webSearch, readPage };
