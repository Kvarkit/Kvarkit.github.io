/* Meatproxy — Signal Garden.
   Progressive enhancement only. Every capability on these pages works with this
   file absent: the Latest/Top switch is two real links backed by :target CSS, the
   article source and report panels are <details>, and the illustration falls back
   to a static chart plus its text description. Nothing here touches the network. */
(() => {
  'use strict';

  /* ---------- feed: Latest / Top ---------- */
  const feedNav = document.querySelector('nav.sort');
  if (feedNav) {
    const main = document.getElementById('main');
    const links = [...feedNav.querySelectorAll('a[data-sort]')];

    const wanted = () => {
      const hash = location.hash.replace('#', '');
      if (hash === 'top' || hash === 'latest') return hash === 'top' ? 'top' : 'new';
      const sort = new URLSearchParams(location.search).get('sort');
      return sort === 'top' ? 'top' : 'new';
    };

    const apply = () => {
      const sort = wanted();
      main.classList.toggle('sort-top', sort === 'top');
      for (const link of links) {
        if (link.dataset.sort === sort) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
    };

    // The links navigate normally, so :target and the query string can never
    // disagree. JS only mirrors the resulting state onto aria-current.
    window.addEventListener('hashchange', apply);
    window.addEventListener('popstate', apply);
    apply();
  }

  /* ---------- article: illustration slot ---------- */
  const figToggle = document.getElementById('fig-toggle');
  if (figToggle) {
    const stage = document.getElementById(figToggle.dataset.stage);
    const status = document.getElementById('fig-status');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setLive = live => {
      stage.classList.toggle('live', live && !reduced.matches);
      figToggle.setAttribute('aria-pressed', String(live));
      figToggle.textContent = live ? 'Show still image' : 'Start interaction';
      if (!live) status.textContent = 'Static illustration.';
      else if (reduced.matches) status.textContent = 'Interaction on. Motion is off by your system preference.';
      else status.textContent = 'Interaction on.';
    };

    figToggle.addEventListener('click', () => {
      setLive(figToggle.getAttribute('aria-pressed') !== 'true');
    });
    reduced.addEventListener?.('change', () => {
      setLive(figToggle.getAttribute('aria-pressed') === 'true');
    });
    setLive(false);
  }

  /* ---------- article: copy link ---------- */
  const copyBtn = document.getElementById('copy-link');
  if (copyBtn) {
    const status = document.getElementById('copy-status');
    const perma = document.getElementById('perma');
    if (perma) perma.textContent = 'Permalink: ' + location.origin + location.pathname;

    copyBtn.addEventListener('click', async () => {
      const url = location.origin + location.pathname;
      try {
        await navigator.clipboard.writeText(url);
        status.textContent = 'Link copied.';
      } catch {
        status.textContent = 'Copy the permalink below to share this page.';
      }
    });
  }

  /* ---------- article: report (demonstration only) ---------- */
  const reportBtn = document.getElementById('report-send');
  if (reportBtn) {
    const status = document.getElementById('report-status');
    const text = document.getElementById('report-text');
    reportBtn.addEventListener('click', () => {
      const value = (text?.value || '').trim();
      status.textContent = value
        ? 'Demonstration only — nothing was sent.'
        : 'Describe the problem first.';
    });
  }
})();
