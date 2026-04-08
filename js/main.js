/* ============================================================
   Remote Factory — main.js
   - Language switcher EN / DE
   - Scroll animations (IntersectionObserver)
   - Sticky nav shadow
   - Mobile hamburger nav
   - Cookie consent banner
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     LANGUAGE SWITCHER
     data-en / data-de attributes on elements
     ------------------------------------------------------- */
  const html = document.documentElement;
  const LANG_KEY = 'rf_lang';

  function applyLang(lang) {
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);

    // Text content nodes
    document.querySelectorAll('[data-en]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val === null) return;

      // Elements that can contain HTML (e.g. cookie banner with <a>)
      if (el.getAttribute('data-html') === 'true' || el.tagName === 'P') {
        // Only update innerHTML if the attr contains tags
        if (val.includes('<')) {
          el.innerHTML = val;
          return;
        }
      }
      // Plain text update
      if (el.tagName !== 'META') {
        el.textContent = val;
      } else {
        el.setAttribute('content', val);
      }
    });

    // Meta description special case
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const val = metaDesc.getAttribute('data-' + lang);
      if (val) metaDesc.setAttribute('content', val);
    }

    // Cookie banner paragraph (contains HTML link)
    const cookieP = document.querySelector('.cookie-text p');
    if (cookieP) {
      const val = cookieP.getAttribute('data-' + lang);
      if (val) cookieP.innerHTML = val;
    }

    // Sync lang buttons
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    localStorage.setItem(LANG_KEY, lang);
  }

  // Wire up all lang buttons (desktop + mobile)
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang-btn')));
  });

  // Init from stored preference or browser language
  const stored = localStorage.getItem(LANG_KEY);
  const browserLang = navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';
  applyLang(stored || browserLang);

  /* -------------------------------------------------------
     SCROLL ANIMATIONS — IntersectionObserver
     ------------------------------------------------------- */
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.animate-on-scroll').forEach(el => animObserver.observe(el));

  /* -------------------------------------------------------
     STICKY NAV — shadow on scroll
     ------------------------------------------------------- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* -------------------------------------------------------
     MOBILE NAV — hamburger toggle
     ------------------------------------------------------- */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');
  let navOpen = false;

  function toggleNav(open) {
    navOpen = (open !== undefined) ? open : !navOpen;
    hamburger.classList.toggle('open', navOpen);
    mobileNav.classList.toggle('open', navOpen);
    hamburger.setAttribute('aria-expanded', String(navOpen));
    document.body.style.overflow = navOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleNav());

  // Close on mobile link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => toggleNav(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navOpen && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      toggleNav(false);
    }
  });

  // Close on scroll
  window.addEventListener('scroll', () => {
    if (navOpen) toggleNav(false);
  }, { passive: true });

  /* -------------------------------------------------------
     COOKIE CONSENT BANNER
     ------------------------------------------------------- */
  const COOKIE_KEY   = 'rf_cookie_consent';
  const banner       = document.getElementById('cookieBanner');
  const acceptBtn    = document.getElementById('cookieAccept');
  const declineBtn   = document.getElementById('cookieDecline');

  function hideBanner() {
    banner.classList.add('hidden');
  }

  // Show only if no decision stored
  if (localStorage.getItem(COOKIE_KEY)) {
    hideBanner();
  }

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    hideBanner();
  });

  declineBtn.addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    hideBanner();
  });

  /* -------------------------------------------------------
     FOOTER YEAR
     ------------------------------------------------------- */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------------
     SMOOTH ANCHOR SCROLLING (offset for fixed nav)
     ------------------------------------------------------- */
  const NAV_H = 68;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
