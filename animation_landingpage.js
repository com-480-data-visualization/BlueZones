window.addEventListener('scroll', () => {
    const titleBlock = document.querySelector('.landing-page-title');
    
    if (!titleBlock) return;

    const scrollPosition = window.scrollY;
    
    const fadePoint = 400; 

    let opacity = 1 - (scrollPosition / fadePoint);
    
    opacity = Math.max(0, Math.min(1, opacity));
    
    titleBlock.style.opacity = opacity;

    titleBlock.style.transform = `translateY(${scrollPosition * (-0.4)}px)`;
});

