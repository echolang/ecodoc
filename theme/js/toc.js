// The outline: which entry is current as the page scrolls, which group is
// unfolded, and the dot that slides to the current entry.
export function initToc(nav) {
  const tocNav = document.querySelector('.toc-nav');
  if (!tocNav) return;
  const marker = tocNav.querySelector('.toc-marker');
  const links = [...tocNav.querySelectorAll('[data-id]')];
  const targets = links
    .map((a) => ({ a, el: document.getElementById(a.dataset.id) }))
    .filter((t) => t.el);
  if (!targets.length) return;

  let active = null;
  let lockUntil = 0;
  let raf = 0;

  function place() {
    if (!active) return;
    const top = active.offsetTop + active.offsetHeight / 2 - 4.5;
    marker.style.top = top + 'px';
    tocNav.classList.add('ready');
  }

  function activate(a) {
    if (a === active) return;
    if (active) active.classList.remove('current');
    active = a;
    a.classList.add('current');
    const group = a.closest('.toc-group');
    for (const g of tocNav.querySelectorAll('.toc-group')) {
      g.classList.toggle('open', g === group && g.querySelector('.tocsub') !== null);
    }
    // the group unfolded, so positions moved: place after layout
    requestAnimationFrame(place);
  }

  function spy() {
    raf = 0;
    if (Date.now() < lockUntil) return;
    let current = targets[0];
    let currentTop = -Infinity;
    for (const t of targets) {
      const top = t.el.getBoundingClientRect().top;
      // entries sharing a top: the first is the one being read
      if (top <= 140 && top > currentTop + 1) {
        current = t;
        currentTop = top;
      }
    }
    const doc = document.scrollingElement || document.documentElement;
    if (doc.scrollHeight > window.innerHeight + 8 && window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
      current = targets[targets.length - 1];
    }
    activate(current.a);
  }

  const onScroll = () => { if (!raf) raf = requestAnimationFrame(spy); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { onScroll(); place(); });

  for (const t of targets) {
    t.a.addEventListener('click', () => {
      lockUntil = Date.now() + 900;
      activate(t.a);
      nav && nav.close();
    });
  }
  spy();
}
