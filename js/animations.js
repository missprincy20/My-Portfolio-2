/* =============================================
   ANIMATIONS.JS — Scroll Reveals & Interactions
   Portfolio: Princy Patle
   ============================================= */
'use strict';

/* ── Intersection Observer — Scroll Reveals ── */
(function initScrollReveals() {
  const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];
  const targets = document.querySelectorAll(revealClasses.join(', '));

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // If inside a .stagger parent, delay is set via CSS
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px',
  });

  targets.forEach(el => observer.observe(el));
})();

/* ── Skill Bar Animations ─────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
})();

/* ── Section Active Highlight Background ─────── */
(function initSectionAccent() {
  // Subtle darkening per section for readability variation
  const sectionOverlays = {
    'hero':           'rgba(8, 8, 16, 0.0)',
    'about':          'rgba(8, 8, 16, 0.15)',
    'experience':     'rgba(8, 8, 16, 0.10)',
    'projects':       'rgba(8, 8, 16, 0.12)',
    'skills':         'rgba(8, 8, 16, 0.10)',
    'education':      'rgba(8, 8, 16, 0.12)',
    'certifications': 'rgba(8, 8, 16, 0.10)',
    'contact':        'rgba(8, 8, 16, 0.15)',
  };

  // This is handled via CSS section backgrounds, so this function
  // is a no-op but preserved for future enhancement.
})();

/* ── Lazy image load fade ─────────────────────── */
(function initImageFade() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
  });
})();

/* ── Project card tilt (desktop only) ─────────── */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -4;
      const tiltY  = dx * 4;
      card.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();

/* ── Nav progress line ─────────────────────────── */
(function initNavProgress() {
  const bar = document.getElementById('nav-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = progress + '%';
  }, { passive: true });
})();

/* ── Section entrance counter animation ─────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseFloat(el.dataset.count);
      const suffix  = el.dataset.suffix || '';
      const isFloat = el.dataset.float === 'true';
      const dur     = 1400;
      const start   = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = target * eased;
        el.textContent = (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();
