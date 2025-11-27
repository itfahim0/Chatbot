const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const axios = require('axios');

async function parseFile(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();

    try {
        if (extension === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);

            // Handle different versions of pdf-parse (v1 export is function, v2 export is object)
            let pdfParser = pdf;
            if (typeof pdf !== 'function') {
                if (typeof pdf.default === 'function') {
                    pdfParser = pdf.default;
                } else if (typeof pdf === 'object' && pdf !== null) {
                    // Some versions might export an object with a parse method or similar
                    // But typically v1 is function, v2 might be different. 
                    // If it's an object but not a function, we might be in trouble or it's a different lib structure.
                    // Let's try to see if it has a default export or if it IS the module.
                    console.warn('pdf-parse is not a function, checking structure:', Object.keys(pdf));
                }
            }

            if (typeof pdfParser !== 'function') {
                throw new Error(`pdf-parse library is not a function. Type: ${typeof pdfParser}`);
            }

            const data = await pdfParser(dataBuffer);
            return data.text;
        } else if (extension === 'docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (extension === 'txt' || extension === 'md') {
            return fs.readFileSync(filePath, 'utf8');
        } else {
            console.warn(`Unsupported file type: ${extension}`);
            return null;
        }
    } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error);
        return null;
    }
}

async function parseUrl(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove scripts, styles, and other non-content elements
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();

        // Get text from body
        const text = $('body').text();

        // Clean up whitespace
        return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error(`Error parsing URL ${url}:`, error);
        return null;
    }
}

module.exports = { parseFile, parseUrl };
