document.querySelectorAll('.task-row input').forEach((input) => {
  input.addEventListener('change', () => {
    input.closest('.task-row').classList.toggle('bg-emerald-50', input.checked);
    input.closest('.task-row').classList.toggle('border-emerald-200', input.checked);
  });
});
