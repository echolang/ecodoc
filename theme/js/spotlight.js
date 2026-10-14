// Spotlight search: Cmd-K, Ctrl-K or `/` opens a dialog over the page. The
// index is one JSON file the build writes, fetched the first time the dialog
// opens. Entries are short: `u` url, `t` title, `p` where it lives, `g` group,
// `k` kind, `s` summary, `w` extra words.
const GROUPS = [
  ['member', 'Members'],
  ['module', 'Modules'],
  ['page', 'Pages'],
  ['section', 'Sections'],
];
const PER_GROUP = 8;

export function initSpotlight(base, nav) {
  const triggers = document.querySelectorAll('[data-search]');
  let index = null;
  let loading = null;
  let wrap = null;
  let input = null;
  let results = null;
  let count = null;
  let flat = [];
  let sel = 0;
  let lastFocus = null;

  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch(base + 'search-index.json')
        .then((r) => (r.ok ? r.json() : { entries: [] }))
        .catch(() => ({ entries: [] }))
        .then((data) => {
          index = (data.entries || []).map((e) => ({
            ...e,
            tl: (e.t || '').toLowerCase(),
            pl: (e.p || '').toLowerCase(),
            wl: ((e.w || '') + ' ' + (e.s || '')).toLowerCase(),
          }));
          return index;
        });
    }
    return loading;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    wrap = el('div', 'spotwrap');
    const scrim = el('button', 'spotscrim');
    scrim.type = 'button';
    scrim.setAttribute('aria-label', 'Close search');
    scrim.tabIndex = -1;
    scrim.addEventListener('click', close);
    const box = el('div', 'spotbox');
    for (const c of ['', ' e2', ' e3']) {
      const ring = el('span', 'echo-ring' + c);
      ring.setAttribute('aria-hidden', 'true');
      box.appendChild(ring);
    }
    const spot = el('div', 'spot');
    spot.setAttribute('role', 'dialog');
    spot.setAttribute('aria-modal', 'true');
    spot.setAttribute('aria-label', 'Search');

    const head = el('div', 'spot-head');
    head.innerHTML = '<svg class="spot-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';
    const label = el('label', null, 'Search');
    label.htmlFor = 'spot-input';
    label.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
    input = el('input', 'spot-input');
    input.id = 'spot-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    const name = document.querySelector('.brand-name');
    input.placeholder = 'Search ' + (name ? name.textContent : 'the docs');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-controls', 'spot-results');
    input.setAttribute('aria-expanded', 'true');
    const esc = el('button', 'spot-esc', 'esc');
    esc.type = 'button';
    esc.addEventListener('click', close);
    head.append(label, input, esc);

    results = el('div', 'spot-results');
    results.id = 'spot-results';
    results.setAttribute('role', 'listbox');

    const foot = el('div', 'spot-foot');
    foot.innerHTML = '<span><kbd>↑</kbd><kbd>↓</kbd>navigate</span><span><kbd>↵</kbd>open</span><span><kbd>esc</kbd>close</span><span class="grow"></span>';
    count = el('span', 'spot-count');
    foot.appendChild(count);

    spot.append(head, results, foot);
    box.appendChild(spot);
    wrap.append(scrim, box);

    input.addEventListener('input', () => { sel = 0; draw(); });
    input.addEventListener('keydown', onKey);
  }

  function open() {
    if (wrap && wrap.isConnected) return;
    nav && nav.close(true);
    lastFocus = document.activeElement;
    if (!wrap) build();
    wrap.classList.remove('closing');
    input.value = '';
    sel = 0;
    document.body.appendChild(wrap);
    document.documentElement.style.overflow = 'hidden';
    input.focus();
    draw();
    load().then(() => { if (wrap.isConnected) draw(); });
  }

  function close() {
    if (!wrap || !wrap.isConnected || wrap.classList.contains('closing')) return;
    wrap.classList.add('closing');
    const done = () => {
      wrap.remove();
      wrap.classList.remove('closing');
      document.documentElement.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) done(); else setTimeout(done, 160);
  }

  function score(e, words, q) {
    let total = 0;
    for (const w of words) {
      let s = 0;
      if (e.tl === w) s = 100;
      else if (e.tl.startsWith(w)) s = 80;
      else if (e.tl.includes(w)) s = 60;
      else if (e.pl.includes(w)) s = 30;
      else if (e.wl.includes(w)) s = 12;
      else return 0;
      total += s;
    }
    if (words.length > 1 && e.tl.includes(q)) total += 40;
    if (e.g === 'module') total += 6;
    if (e.g === 'member') total += 4;
    return total - Math.min(e.tl.length, 40) * 0.1;
  }

  function search(q) {
    const here = location.pathname;
    const words = q.split(/\s+/).filter(Boolean);
    const groups = new Map(GROUPS.map(([g]) => [g, []]));
    if (!index) return groups;
    if (!words.length) {
      // nothing typed: what this page holds
      for (const e of index) {
        if (e.g === 'module') continue;
        const path = e.u.split('#')[0];
        if (path === here && groups.has(e.g)) groups.get(e.g).push({ e, s: 0 });
      }
    } else {
      for (const e of index) {
        const s = score(e, words, q);
        if (s > 0 && groups.has(e.g)) groups.get(e.g).push({ e, s });
      }
      for (const list of groups.values()) list.sort((a, b) => b.s - a.s);
    }
    for (const [g, list] of groups) groups.set(g, list.slice(0, PER_GROUP));
    return groups;
  }

  function nameNode(e, q) {
    const name = el('span', 'spot-name');
    const word = q.split(/\s+/).filter(Boolean)[0] || '';
    const at = word ? e.tl.indexOf(word) : -1;
    if (at < 0) {
      name.textContent = e.t;
      return name;
    }
    name.append(document.createTextNode(e.t.slice(0, at)));
    name.append(el('mark', null, e.t.slice(at, at + word.length)));
    name.append(document.createTextNode(e.t.slice(at + word.length)));
    return name;
  }

  function draw() {
    const q = input.value.trim().toLowerCase();
    const groups = search(q);
    results.textContent = '';
    flat = [];
    let i = 0;
    for (const [g, label] of GROUPS) {
      const list = groups.get(g) || [];
      if (!list.length) continue;
      const group = el('div', 'spot-group');
      group.appendChild(el('div', 'spot-group-label', label));
      for (const { e } of list) {
        const n = i++;
        const row = el('button', 'spotrow');
        row.type = 'button';
        row.id = 'spot-item-' + n;
        row.setAttribute('role', 'option');
        row.style.animationDelay = (Math.min(n, 12) * 22 + 60) + 'ms';
        const kind = el('span', 'spot-kind ' + (e.k || ''), e.k || '');
        const text = el('span', 'spot-text');
        text.appendChild(nameNode(e, q));
        const meta = e.s ? (e.p ? e.p + ' - ' + e.s : e.s) : (e.p || '');
        if (meta) text.appendChild(el('span', 'spot-meta', meta));
        const enter = el('span', 'spot-enter', '↵');
        enter.setAttribute('aria-hidden', 'true');
        row.append(kind, text, enter);
        row.addEventListener('click', () => pick(n));
        row.addEventListener('mousemove', () => { if (sel !== n) { sel = n; mark(); } });
        group.appendChild(row);
        flat.push({ e, row });
      }
      results.appendChild(group);
    }
    if (!flat.length) {
      const empty = el('div', 'spot-empty');
      if (!index) {
        empty.appendChild(el('span', null, 'Loading the index...'));
      } else if (q) {
        empty.appendChild(el('strong', null, 'No results for "' + input.value.trim() + '"'));
        empty.appendChild(el('span', null, 'Try a type, a member name, or a page title.'));
      } else {
        empty.appendChild(el('span', null, 'Type to search pages, types and members.'));
      }
      results.appendChild(empty);
    }
    if (sel > flat.length - 1) sel = Math.max(0, flat.length - 1);
    count.textContent = flat.length + (flat.length === 1 ? ' result' : ' results');
    mark();
  }

  function mark() {
    flat.forEach(({ row }, n) => {
      row.classList.toggle('sel', n === sel);
      row.setAttribute('aria-selected', n === sel ? 'true' : 'false');
    });
    const cur = flat[sel];
    if (cur) {
      input.setAttribute('aria-activedescendant', cur.row.id);
      cur.row.scrollIntoView({ block: 'nearest' });
    }
  }

  function pick(n) {
    const hit = flat[n];
    if (!hit) return;
    const url = hit.e.u;
    close();
    const [path, hash] = url.split('#');
    if (path === location.pathname && hash) {
      const target = document.getElementById(decodeURIComponent(hash));
      history.pushState(null, '', '#' + hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    location.href = url;
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, flat.length - 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  }

  for (const t of triggers) t.addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (wrap && wrap.isConnected) close(); else open();
    } else if (e.key === '/' && !typing && !(wrap && wrap.isConnected)) {
      e.preventDefault();
      open();
    }
  });
  // warm the index once the page is idle, so the first open is instant
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
  idle(() => load());

  // the shortcut reads right on each platform
  if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
    for (const k of document.querySelectorAll('.search kbd')) k.textContent = 'Ctrl K';
  }
}
