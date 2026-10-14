// The sidebar drawer and the outline drop-down on narrow screens, plus
// collapsible sidebar groups. Both overlays share one scrim, and only one is open at a time.
export function initNav() {
  const side = document.querySelector('[data-side]');
  const toc = document.querySelector('[data-toc]');
  const scrim = document.querySelector('[data-scrim]');
  const menuBtn = document.querySelector('[data-menu]');
  const tocBtn = document.querySelector('[data-toc-toggle]');
  let closing = 0;

  const isOpen = () => (side && side.classList.contains('open')) || (toc && toc.classList.contains('open'));

  function open(el, btn) {
    close(true);
    if (!el) return;
    el.classList.add('open');
    scrim && scrim.classList.add('open');
    btn && btn.setAttribute('aria-expanded', 'true');
  }

  function close(now) {
    if (!isOpen()) return;
    const els = [side, toc, scrim].filter(Boolean);
    const done = () => {
      for (const el of els) el.classList.remove('open', 'closing');
      menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
      tocBtn && tocBtn.setAttribute('aria-expanded', 'false');
    };
    clearTimeout(closing);
    if (now === true || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done();
      return;
    }
    for (const el of els) if (el.classList.contains('open')) el.classList.add('closing');
    closing = setTimeout(done, 200);
  }

  menuBtn && menuBtn.addEventListener('click', () => {
    if (side && side.classList.contains('open')) close(); else open(side, menuBtn);
  });
  tocBtn && tocBtn.addEventListener('click', () => {
    if (toc && toc.classList.contains('open')) close(); else open(toc, tocBtn);
  });
  scrim && scrim.addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close();
  });
  side && side.addEventListener('click', (e) => {
    if (e.target.closest('a')) close(true);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1180) close(true);
  });

  for (const toggle of document.querySelectorAll('.side-group [data-side-toggle]')) {
    toggle.addEventListener('click', () => {
      const collapsed = toggle.closest('.side-group').classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  // keep the current sidebar entry in view
  const current = side && side.querySelector('[aria-current="page"]');
  if (current && side.scrollHeight > side.clientHeight) {
    const top = current.offsetTop - side.clientHeight / 3;
    if (top > 0) side.scrollTop = top;
  }

  return { close };
}
