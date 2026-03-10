const cards = Array.from(document.querySelectorAll('.card'));

cards.forEach((card, index) => {
  card.style.animationDelay = `${index * 0.08}s`;
  card.classList.add('reveal');
});

const shapes = Array.from(document.querySelectorAll('.bg-shape'));

window.addEventListener('mousemove', (event) => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;

  shapes.forEach((shape, index) => {
    const moveX = (x - 0.5) * (index + 1) * 10;
    const moveY = (y - 0.5) * (index + 1) * 10;
    shape.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});
