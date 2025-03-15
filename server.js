const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.post('/api/generate-gifts', async (req, res) => {
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.body.apiKey}`,
                'HTTP-Referer': req.headers['http-referer'] || 'https://diettraqr.com',
                'X-Title': req.headers['x-title'] || 'Aloft Giftings',
                'OR-SITE-URL': req.headers['or-site-url'] || 'https://diettraqr.com'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling OpenRouter:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
}); 