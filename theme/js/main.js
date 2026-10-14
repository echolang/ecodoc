// ecodoc's client side, booted once per page. Module scripts run after the
// document is parsed, so every element the modules look for is already there.
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initToc } from './toc.js';
import { initCopy } from './copy.js';
import { initSpotlight } from './spotlight.js';

const base = document.body.dataset.base || '/';

initTheme();
const nav = initNav();
initToc(nav);
initCopy();
initSpotlight(base, nav);
