const cards = document.querySelectorAll('.blue-zone-card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('is-flipped');
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('is-flipped');
    }
  });

  const src = card.querySelector('.blue-zone-card-image')?.src;
  if (src) {
    const blur = document.createElement('div');
    blur.className = 'card-back-blur';
    blur.style.backgroundImage = `url(${src})`;
    card.querySelector('.blue-zone-card-back').prepend(blur);
  }
});