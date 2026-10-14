// Copy buttons on code windows. A window with an output column copies the
// code only, not the output.
export function initCopy() {
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('.copy');
    if (!button) return;
    const block = button.closest('.code');
    if (!block) return;
    let text = '';
    const rows = block.querySelectorAll('.row code');
    if (rows.length) {
      text = [...rows].map((c) => c.textContent.replace(/\s+$/, '')).join('\n');
    } else {
      const pre = block.querySelector('pre');
      text = pre ? pre.textContent : '';
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const label = button.textContent;
    button.textContent = 'Copied';
    button.classList.add('done');
    setTimeout(() => { button.textContent = label; button.classList.remove('done'); }, 1600);
  });
}
