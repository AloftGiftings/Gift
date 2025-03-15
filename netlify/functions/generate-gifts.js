const axios = require('axios');

exports.handler = async (event) => {
    try {
        const { occasion, recipient, budget, interests, extraInfo } = JSON.parse(event.body);
        
        const prompt = `
            I need gift ideas for a ${recipient} for ${occasion}. 
            Budget: ${budget}
            ${interests ? `They are interested in: ${interests}` : ''}
            ${extraInfo ? `Additional information: ${extraInfo}` : ''}
            
            Please suggest 5 thoughtful gift ideas that fit these criteria. For each gift idea, provide:
            1. A title/name for the gift
            2. A brief description of why it's a good fit
            3. An approximate price range
            
            Format your response as a JSON array with objects containing title, description, and priceRange fields.
        `;
        
        // Hardcode the API key temporarily for testing
        const apiKey = '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';
        
        console.log("Making request to OpenRouter API...");
        
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "openai/gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful gift recommendation assistant. Provide thoughtful, specific gift ideas based on the criteria given. Always respond with properly formatted JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://diettraqr.com',
                'X-Title': 'Aloft Giftings',
                'OR-SITE-URL': 'https://diettraqr.com'
            }
        });
        
        console.log("OpenRouter API response received");
        
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        console.error("Function error:", error.message);
        console.error("Response data:", error.response?.data);
        
        return {
            statusCode: error.response?.status || 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ 
                error: error.message,
                details: error.response?.data || "No additional details"
            })
        };
    }
}; 