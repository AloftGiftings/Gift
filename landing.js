document.addEventListener('DOMContentLoaded', () => {
    // Simple animation for the gift illustration
    const giftIllustration = document.querySelector('.gift-illustration');
    
    if (giftIllustration) {
        giftIllustration.addEventListener('mouseover', () => {
            giftIllustration.style.transform = 'rotate(5deg) scale(1.05)';
        });
        
        giftIllustration.addEventListener('mouseout', () => {
            giftIllustration.style.transform = 'rotate(0) scale(1)';
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}); 