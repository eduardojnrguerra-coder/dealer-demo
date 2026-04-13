const priorityButtons = document.querySelectorAll('[data-priority]');
const leadCards = document.querySelectorAll('.lead-card');

priorityButtons.forEach((button) => {
  button.addEventListener('click', () => {
    priorityButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const priority = button.dataset.priority;
    leadCards.forEach((card) => {
      card.style.display = priority === 'All' || card.dataset.priority === priority ? '' : 'none';
    });
  });
});
