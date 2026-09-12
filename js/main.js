/* =============================================
   MAIN.JS — Navigation, Scroll, Cosmic Canvas
   Portfolio: Princy Patle
   ============================================= */
'use strict';

/* ── Video + Canvas Background ──────────────── */
(function initBackground() {
  const videoWrap = document.querySelector('.bg-video-wrap');
  const video     = document.querySelector('.bg-video-wrap video');
  const canvas    = document.getElementById('bg-canvas');

  // Canvas starts immediately — gives instant atmospheric background
  if (canvas) startCanvasBg(canvas);

  if (video) {
    video.addEventListener('canplay', () => {
      // Video loaded successfully — hide canvas to save GPU
      if (canvas) canvas.style.display = 'none';
    });
    video.addEventListener('error', () => {
      if (videoWrap) videoWrap.style.display = 'none';
    });
    // If no video after 2s, hide video element cleanly
    setTimeout(() => {
      if (video.readyState === 0) {
        if (videoWrap) videoWrap.style.display = 'none';
      }
    }, 2000);
  }
})();

/* ── Cosmic Canvas Background ────────────────── */
function startCanvasBg(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], nebulas = [], animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStar() {
    const roll   = Math.random();
    const isCyan = roll > 0.72;
    const isGold = !isCyan && roll < 0.12;
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      vx:   (Math.random() - 0.5) * 0.06,
      vy:   (Math.random() - 0.5) * 0.05,
      r:    Math.random() * 1.1 + 0.15,
      a:    Math.random() * 0.5 + 0.1,
      da:   (Math.random() - 0.5) * 0.002,
      color: isCyan ? '86,209,232' : isGold ? '201,168,76' : '220,232,245',
    };
  }

  function init() {
    resize();
    const count = Math.min(180, Math.floor(W * H / 9000));
    stars   = Array.from({ length: count }, createStar);
    nebulas = [
      { x: 0.15, y: 0.30, rx: 0.30, ry: 0.20, c: '26,92,110',  a: 0.11 },
      { x: 0.85, y: 0.65, rx: 0.28, ry: 0.22, c: '15,35,70',   a: 0.13 },
      { x: 0.50, y: 0.12, rx: 0.40, ry: 0.14, c: '201,168,76', a: 0.04 },
      { x: 0.50, y: 0.90, rx: 0.35, ry: 0.12, c: '86,209,232', a: 0.04 },
      { x: 0.75, y: 0.25, rx: 0.20, ry: 0.18, c: '26,50,100',  a: 0.09 },
    ];
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // Deep midnight-navy base
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#040912');
    bg.addColorStop(0.45,'#060d1a');
    bg.addColorStop(1,   '#040912');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Nebula clouds
    nebulas.forEach((n, i) => {
      const ox = n.x * W + Math.sin(t * 0.00025 + i * 1.3) * W * 0.025;
      const oy = n.y * H + Math.cos(t * 0.0002  + i * 0.8) * H * 0.025;
      const gx = ctx.createRadialGradient(ox, oy, 0, ox, oy, n.rx * W);
      gx.addColorStop(0,   `rgba(${n.c}, ${n.a})`);
      gx.addColorStop(0.55,`rgba(${n.c}, ${n.a * 0.25})`);
      gx.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = gx;
      ctx.beginPath();
      ctx.ellipse(ox, oy, n.rx * W, n.ry * H, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stars
    stars.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.da;
      if (p.a <= 0.06 || p.a >= 0.72) p.da *= -1;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = `rgba(${p.color}, 1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      // Subtle halo on larger stars
      if (p.r > 0.85) {
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        halo.addColorStop(0, `rgba(${p.color}, ${p.a * 0.28})`);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    animId = requestAnimationFrame(draw);
  }

  init();
  animId = requestAnimationFrame(draw);
  window.addEventListener('resize', () => {
    resize();
    init();
  });
}

/* ── Navigation ──────────────────────────────── */
const nav          = document.getElementById('main-nav');
const hamburger    = document.getElementById('nav-hamburger');
const mobileNav    = document.getElementById('nav-mobile');
const mobileLinks  = mobileNav ? mobileNav.querySelectorAll('a') : [];
const navLinks     = document.querySelectorAll('.nav-links a[data-section]');

// Scroll → sticky nav
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  updateActiveNav();
  updateProgress();
}, { passive: true });

// Reading progress bar
function updateProgress() {
  const bar = document.getElementById('nav-progress');
  if (!bar) return;
  const docH   = document.documentElement.scrollHeight - window.innerHeight;
  const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
  bar.style.width = pct + '%';
}

// Hamburger
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    if (isOpen) {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Active nav highlight
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  let current    = '';

  sections.forEach(sec => {
    if (sec.offsetTop <= scrollY) current = sec.id;
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

/* ── Smooth Scroll ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Custom Cursor ───────────────────────────── */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  }, { passive: true });

  function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  rafId = requestAnimationFrame(animateRing);

  const hoverTargets = 'a, button, .project-card, .cert-card, .skill-tag, input, textarea';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('expanded'));
    el.addEventListener('mouseleave', () => ring.classList.remove('expanded'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ── Scroll Reveal ───────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

/* ── Stat Counter Animation ──────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseFloat(el.dataset.count);
      const isFloat = el.dataset.float === 'true';
      const suffix  = el.dataset.suffix || '';
      const dur     = 1200;
      const start   = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const v = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        el.textContent = isFloat
          ? (v * target).toFixed(1) + suffix
          : Math.round(v * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ── Contact Form ────────────────────────────── */
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name    = this.querySelector('[name="name"]').value.trim();
    const email   = this.querySelector('[name="email"]').value.trim();
    const message = this.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      if (formStatus) {
        formStatus.style.color = '#e57373';
        formStatus.textContent = 'Please fill in all fields.';
      }
      return;
    }

    // Build mailto link
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:princypatle10@gmail.com?subject=${subject}&body=${body}`;

    if (formStatus) {
      formStatus.style.color = '#c9a84c';
      formStatus.textContent = '✦ Opening your mail client...';
    }
    this.reset();
  });
}

/* ── Typing effect for hero role ─────────────── */
(function initTyping() {
  const el = document.getElementById('hero-typing');
  if (!el) return;

  const roles = [
    'AI & ML Engineer',
    'Backend Developer',
    'LLM Enthusiast',
    'CS Undergraduate',
  ];

  let roleIdx = 0, charIdx = 0, isDeleting = false;

  function type() {
    const current = roles[roleIdx];
    el.textContent = isDeleting
      ? current.substring(0, charIdx - 1)
      : current.substring(0, charIdx + 1);

    isDeleting ? charIdx-- : charIdx++;

    let delay = isDeleting ? 50 : 80;

    if (!isDeleting && charIdx === current.length) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 1600);
})();
