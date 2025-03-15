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
        try {
            console.log("Attempting API request via Netlify Function...");
            
            const response = await fetch('/api/generate-gifts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    occasion,
                    recipient,
                    budget,
                    interests,
                    extraInfo
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                console.error("Netlify Function error response:", errorData);
                throw new Error(errorData.error || `Function Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Netlify Function response received successfully");
            
            const content = data.choices[0].message.content;
            try {
                return JSON.parse(content);
            } catch (parseError) {
                console.error("Error parsing JSON response:", parseError);
                throw new Error("Could not parse API response");
            }
            
        } catch (error) {
            console.warn("API request failed, using fallback data:", error);
            
            // Fallback data
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