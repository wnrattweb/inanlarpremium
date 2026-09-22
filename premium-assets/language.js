/* Resolve the language before rendering; keep every existing page URL. */
(() => {
  'use strict';
  const routes = {
    home: ['index.html', 'en/index.html'],
    about: ['hakkimizda.html', 'en/about-us.html'],
    stay: ['suit-ve-villa.html', 'en/suites-and-villas.html'],
    gallery: ['fotograflar.html', 'en/photos.html'],
    place: ['uzungol.html', 'en/uzungol.html'],
    contact: ['iletisim.html', 'en/contact-us.html']
  };
  const page = document.documentElement.dataset.page;
  const source = document.currentScript;
  if (!routes[page] || !source) return;
  const base = new URL('../', source.src);
  const current = new URL(location.href);
  const pageLanguage = document.documentElement.lang === 'en' ? 'en' : 'tr';
  const storageKey = `inanlar-premium-language:${base.pathname}`;
  const valid = value => value === 'tr' || value === 'en';
  const explicit = current.searchParams.get('lang');
  let saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (_) {}
  if (valid(explicit)) {
    saved = explicit;
    try { localStorage.setItem(storageKey, explicit); } catch (_) {}
  }
  const primary = (navigator.languages && navigator.languages[0]) || navigator.language || 'tr';
  const browserLanguage = /^tr(?:-|$)/i.test(primary.trim()) ? 'tr' : 'en';
  const manual = valid(explicit) ? explicit : valid(saved) ? saved : null;
  const preferred = manual || browserLanguage;
  const destination = (language, from = new URL(location.href)) => {
    const next = new URL(routes[page][language === 'en' ? 1 : 0], base);
    next.search = from.search;
    next.hash = from.hash;
    return next;
  };
  if (preferred !== pageLanguage) {
    // Deferred UI and Analytics scripts skip the page that is being replaced.
    document.documentElement.dataset.languageRedirect = 'true';
    location.replace(destination(preferred, current).href);
    return;
  }
  const connectLinks = () => {
    document.querySelectorAll('[data-language]').forEach(link => {
      const language = link.dataset.language;
      if (!valid(language)) return;
      const next = destination(language);
      next.searchParams.set('lang', language);
      link.href = next.href;
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
        try { localStorage.setItem(storageKey, language); } catch (_) {}
        const target = destination(language);
        target.searchParams.set('lang', language);
        link.href = target.href;
      });
    });
    // A chosen language also survives navigation when storage is unavailable.
    if (manual) {
      const knownPaths = new Set(Object.values(routes).flat().map(route => new URL(route, base).pathname));
      knownPaths.add(base.pathname);
      knownPaths.add(new URL('en/', base).pathname);
      document.querySelectorAll('a[href]:not([data-language])').forEach(link => {
        const target = new URL(link.href, current);
        if (target.origin !== base.origin || !knownPaths.has(target.pathname)) return;
        target.searchParams.set('lang', manual);
        link.href = target.href;
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', connectLinks, { once: true });
  else connectLinks();
})();
