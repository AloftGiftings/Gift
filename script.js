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
            console.log("Making API request with deepseek/deepseek-r1:free model...");
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Aloft Giftings'
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free", // Using the specified free model
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
                    max_tokens: 1000
                })
            });
            
            console.log("API response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Full error response:", errorText);
                
                // Try fallback with the same model but API key in URL
                console.log("Trying fallback approach with API key in URL...");
                
                const fallbackResponse = await fetch(`https://openrouter.ai/api/v1/chat/completions?api_key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'Aloft Giftings'
                    },
                    body: JSON.stringify({
                        model: "deepseek/deepseek-r1:free", // Using the same specified model
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
                        max_tokens: 1000
                    })
                });
                
                if (!fallbackResponse.ok) {
                    throw new Error("All API approaches failed. Using fallback data.");
                }
                
                const fallbackData = await fallbackResponse.json();
                const fallbackContent = fallbackData.choices[0].message.content;
                
                try {
                    return JSON.parse(fallbackContent);
                } catch (parseError) {
                    throw new Error("Could not parse API response. Using fallback data.");
                }
            }
            
            const data = await response.json();
            console.log("API response received successfully");
            
            const content = data.choices[0].message.content;
            
            // Try to parse the JSON from the response
            try {
                return JSON.parse(content);
            } catch (parseError) {
                console.log("Raw content:", content);
                console.error("Parse error:", parseError);
                
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
                
                // If all parsing attempts fail, use fallback data
                throw new Error("Could not parse API response. Using fallback data.");
            }
        } catch (error) {
            console.error("API request or parsing error:", error);
            console.log("Using fallback gift ideas instead");
            
            // Generate dynamic fallback data based on user input
            const dynamicIdeas = generateDynamicFallbackIdeas(occasion, recipient, budget, interests);
            return dynamicIdeas;
        }
    }
    
    // Function to generate more relevant fallback ideas based on user input
    function generateDynamicFallbackIdeas(occasion, recipient, budget, interests) {
        // Base ideas that can be customized
        const baseIdeas = [
            {
                title: "Personalized Photo Album",
                description: "A custom photo album filled with meaningful memories. Great for someone who appreciates sentimental gifts and personal touches.",
                priceRange: "$30-$50"
            },
            {
                title: "Subscription Box",
                description: "A monthly subscription to items related to their interests. This gift keeps on giving throughout the year!",
                priceRange: "$15-$25 per month"
            },
            {
                title: "Premium Headphones",
                description: "High-quality headphones for music lovers or gamers. Perfect for immersive experiences with their favorite content.",
                priceRange: "$80-$150"
            },
            {
                title: "Cooking Class Experience",
                description: "An in-person or online cooking class to learn new skills and recipes. Great for food enthusiasts who enjoy culinary adventures.",
                priceRange: "$50-$100"
            },
            {
                title: "Customized Gift Basket",
                description: "A basket filled with their favorite treats, drinks, and small items tailored to their interests and preferences.",
                priceRange: "$40-$80"
            }
        ];
        
        // Customize descriptions based on recipient and occasion
        return baseIdeas.map(idea => {
            const newIdea = {...idea};
            
            // Customize based on recipient
            if (recipient === "partner" || recipient === "lover") {
                newIdea.description = newIdea.description.replace("someone", "your partner").replace("their", "your partner's");
            } else if (recipient === "family") {
                newIdea.description = newIdea.description.replace("someone", "a family member").replace("their", "your family member's");
            } else if (recipient === "friend") {
                newIdea.description = newIdea.description.replace("someone", "a friend").replace("their", "your friend's");
            }
            
            // Customize based on occasion
            if (occasion === "birthday") {
                newIdea.description += " Perfect for celebrating another year of life.";
            } else if (occasion === "christmas") {
                newIdea.description += " A thoughtful Christmas gift they'll appreciate.";
            } else if (occasion === "anniversary") {
                newIdea.description += " A meaningful way to celebrate your special day together.";
            }
            
            // Customize based on interests if provided
            if (interests) {
                newIdea.description += ` Especially suitable for someone interested in ${interests}.`;
            }
            
            return newIdea;
        });
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