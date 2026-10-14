// The dark/light toggle. The class on <html> is already set before the first
// paint by the inline script in <head>; this only flips it and remembers the choice.
const KEY = 'ecodoc-theme';

export function initTheme() {
  const root = document.documentElement;
  for (const button of document.querySelectorAll('[data-theme-toggle]')) {
    const label = () => {
      const dark = root.classList.contains('theme-dark');
      const text = dark ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', text);
      button.setAttribute('title', text);
    };
    label();
    button.addEventListener('click', () => {
      const next = root.classList.contains('theme-dark') ? 'light' : 'dark';
      root.className = 'theme-' + next;
      try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
      // re-run the icon animation
      for (const svg of button.querySelectorAll('svg')) {
        svg.style.animation = 'none';
        void svg.offsetWidth;
        svg.style.animation = '';
      }
      label();
    });
  }
}
