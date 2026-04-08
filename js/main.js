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
     HERO CANVAS — animated engineering mesh
     ------------------------------------------------------- */
  (function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes, rafId;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.parentElement.offsetWidth;
      H = canvas.parentElement.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      buildNodes();
    }

    function buildNodes() {
      const count = Math.min(90, Math.max(50, Math.floor(W * H / 14000)));
      nodes = Array.from({ length: count }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    (Math.random() - 0.5) * 0.26,
        vy:    (Math.random() - 0.5) * 0.26,
        big:   Math.random() > 0.82,
        red:   Math.random() > 0.91,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      /* — dot grid — */
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      const GRID = 44;
      for (let gx = GRID / 2; gx < W; gx += GRID)
        for (let gy = GRID / 2; gy < H; gy += GRID) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }

      /* — connections — */
      const MAX = 145;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX) {
            const alpha = (1 - d / MAX) * (a.red || b.red ? 0.28 : 0.13);
            ctx.strokeStyle = a.red || b.red
              ? `rgba(213,43,30,${alpha.toFixed(3)})`
              : `rgba(255,255,255,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      /* — nodes — */
      nodes.forEach(n => {
        n.phase += 0.019;
        const p   = 0.5 + 0.5 * Math.sin(n.phase);
        const r   = n.big ? 2.6 : 1.4;

        if (n.red) {
          /* outer pulse ring */
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 7 * p, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(213,43,30,${(0.08 * p).toFixed(3)})`;
          ctx.fill();
          /* core */
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(213,43,30,${(0.55 + 0.3 * p).toFixed(3)})`;
          ctx.fill();
          /* cross arms */
          const arm = 7 + 2 * p;
          ctx.strokeStyle = `rgba(213,43,30,${(0.28 + 0.18 * p).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(n.x - arm, n.y); ctx.lineTo(n.x + arm, n.y);
          ctx.moveTo(n.x, n.y - arm); ctx.lineTo(n.x, n.y + arm);
          ctx.stroke();
        } else if (n.big) {
          /* larger white node + cross */
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${(0.32 + 0.14 * p).toFixed(3)})`;
          ctx.fill();
          const arm = 5;
          ctx.strokeStyle = `rgba(255,255,255,${(0.12 + 0.08 * p).toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(n.x - arm, n.y); ctx.lineTo(n.x + arm, n.y);
          ctx.moveTo(n.x, n.y - arm); ctx.lineTo(n.x, n.y + arm);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${(0.2 + 0.1 * p).toFixed(3)})`;
          ctx.fill();
        }

        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx = -n.vx;
        if (n.y < 0 || n.y > H) n.vy = -n.vy;
      });

      rafId = requestAnimationFrame(frame);
    }

    resize();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    }, { passive: true });

    /* pause when hero scrolls off-screen */
    const heroEl = document.querySelector('.hero');
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          if (!rafId) rafId = requestAnimationFrame(frame);
        } else {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }).observe(heroEl);
    }

    frame();
  }());

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
