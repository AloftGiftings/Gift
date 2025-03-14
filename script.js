document.addEventListener('DOMContentLoaded', () => {
    const giftForm = document.getElementById('gift-form');
    const resultsSection = document.getElementById('results-section');
    const loadingAnimation = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');
    const giftIdeasContainer = document.getElementById('gift-ideas');
    
    giftForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const occasion = document.getElementById('occasion').value;
        const recipient = document.getElementById('recipient').value;
        const budget = document.getElementById('budget').value;
        const interests = document.getElementById('interests').value || '';
        const extraInfo = document.getElementById('extra-info').value || '';
        
        // Show loading animation
        resultsSection.classList.remove('hidden');
        loadingAnimation.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        giftIdeasContainer.innerHTML = '';
        
        try {
            const giftIdeas = await generateGiftIdeas(occasion, recipient, budget, interests, extraInfo);
            displayGiftIdeas(giftIdeas);
        } catch (error) {
            console.error('Error generating gift ideas:', error);
            giftIdeasContainer.innerHTML = `
                <div class="error-message">
                    <p>Sorry, we encountered an error while generating gift ideas: ${error.message}</p>
                    <p>Please try again later or check your connection.</p>
                </div>
            `;
        } finally {
            loadingAnimation.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
        }
    });
    
    async function generateGiftIdeas(occasion, recipient, budget, interests, extraInfo) {
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
        
        // API Key for OpenRouter
        const apiKey = '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';
        
        try {
            console.log("Attempting API request to OpenRouter...");
            
            // First try to use real API
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'Aloft Giftings',
                        'OR-SITE-URL': 'https://diettraqr.com'
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-3.5-turbo", // Try a different model
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
                    })
                });
                
                console.log("OpenRouter response status:", response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API error response:", errorText);
                    throw new Error(`API Error: ${errorText}`);
                }
                
                const data = await response.json();
                console.log("API response received successfully");
                
                const content = data.choices[0].message.content;
                console.log("Processing content:", content.substring(0, 100) + "...");
                
                // Try to parse JSON from the response
                try {
                    return JSON.parse(content);
                } catch (parseError) {
                    console.warn("JSON parse error, falling back to text processing:", parseError);
                    
                    // If JSON parsing fails, try to extract structured data
                    const ideas = [];
                    const sections = content.split(/\d+\.\s/).filter(Boolean);
                    
                    for (const section of sections) {
                        if (section.trim()) {
                            const lines = section.split('\n').filter(Boolean);
                            const title = lines[0].replace(/^[^a-zA-Z0-9]+/, '').trim();
                            const description = lines.slice(1, -1).join(' ').trim();
                            const priceRange = lines[lines.length - 1].includes('$') ? 
                                lines[lines.length - 1].trim() : 'Price varies';
                            
                            ideas.push({ title, description, priceRange });
                        }
                    }
                    
                    if (ideas.length > 0) {
                        return ideas;
                    }
                    
                    throw new Error("Could not parse AI response");
                }
            } catch (apiError) {
                console.warn("API request failed, using fallback data:", apiError);
                
                // Fallback data customized based on user input
                return [
                    {
                        title: `Personalized ${interests || 'Gift'} Basket`,
                        description: `A custom collection of ${interests || 'favorite'} items tailored for your ${recipient} for ${occasion}.`,
                        priceRange: budget === "luxury" ? "$200+" : (budget === "under50" ? "$30-$50" : "$50-$100")
                    },
                    {
                        title: `${interests || 'Premium'} Subscription Service`,
                        description: `A monthly subscription that delivers curated ${interests || 'items'} to your ${recipient}'s door.`,
                        priceRange: "$15-$25 per month"
                    },
                    {
                        title: `High-Quality ${interests || 'Tech'} Accessory`,
                        description: `A durable, premium accessory that enhances their ${interests || 'daily'} experience.`,
                        priceRange: budget === "luxury" ? "$150-$250" : "$80-$150"
                    },
                    {
                        title: `${interests || 'Creative'} Experience`,
                        description: `An in-person or online ${interests || 'class'} or experience they'll remember.`,
                        priceRange: "$50-$100"
                    },
                    {
                        title: `Personalized ${occasion} Keepsake`,
                        description: `A customized memento to commemorate this special ${occasion} that your ${recipient} will treasure.`,
                        priceRange: "$40-$80"
                    }
                ];
            }
        } catch (error) {
            console.error("Error in gift generation:", error);
            throw error;
        }
    }
    
    function displayGiftIdeas(giftIdeas) {
        giftIdeasContainer.innerHTML = '';
        
        if (!Array.isArray(giftIdeas) || giftIdeas.length === 0) {
            giftIdeasContainer.innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't generate gift ideas with the provided criteria. Please try again with different options.</p>
                </div>
            `;
            return;
        }
        
        giftIdeas.forEach((idea, index) => {
            const ideaElement = document.createElement('div');
            ideaElement.className = 'gift-idea';
            ideaElement.style.animationDelay = `${index * 0.1}s`;
            
            // Sanitize the data to prevent XSS
            const title = idea.title ? String(idea.title).replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'Gift Idea';
            const description = idea.description ? String(idea.description).replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'No description available';
            const priceRange = idea.priceRange ? String(idea.priceRange).replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'Price varies';
            
            ideaElement.innerHTML = `
                <h3>${title}</h3>
                <p>${description}</p>
                <p class="price"><strong>Price Range:</strong> ${priceRange}</p>
            `;
            
            giftIdeasContainer.appendChild(ideaElement);
        });
    }
}); 