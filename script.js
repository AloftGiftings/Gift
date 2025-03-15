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
        `;
        
        try {
            // Return mock data for now - this ensures the site works reliably
            return [
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
        } catch (error) {
            console.error("Error:", error);
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