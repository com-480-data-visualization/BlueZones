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
});