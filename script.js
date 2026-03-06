/* =====================================================
   Hi-Fi Wi-Fi — Main JavaScript
   Particle System, Smooth Scroll, Slider, Animations
   ===================================================== */

(function () {
  'use strict';

  // ─── Loading Screen ───
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 1800);
  });

  // ─── Navbar Scroll Effect ───
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  function updateNav() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);

    // Active link
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (scrollY >= top) current = section.getAttribute('id');
    });
    navLinksAll.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateNav);
  updateNav();

  // ─── Mobile Nav Toggle ───
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ─── Scroll Reveal ───
  const animEls = document.querySelectorAll('[data-animate]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  animEls.forEach(el => revealObserver.observe(el));

  // ─── Stat Counter Animation ───
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isFloat = target % 1 !== 0;
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => counterObserver.observe(el));

  // ═════════════════════════════════
  //  PARTICLE CANVAS (Hero)
  // ═════════════════════════════════
  const heroCanvas = document.getElementById('particleCanvas');
  const hCtx = heroCanvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 120;
  const CONNECTION_DIST = 140;
  let mouseX = -1000, mouseY = -1000;

  function resizeHeroCanvas() {
    heroCanvas.width = heroCanvas.offsetWidth * window.devicePixelRatio;
    heroCanvas.height = heroCanvas.offsetHeight * window.devicePixelRatio;
    hCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  class Particle {
    constructor(w, h) {
      this.reset(w, h);
    }
    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.r = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update(w, h) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;

      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.02;
        this.vx += dx * force;
        this.vy += dy * force;
      }

      // Damping
      this.vx *= 0.998;
      this.vy *= 0.998;
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 180, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const w = heroCanvas.offsetWidth;
    const h = heroCanvas.offsetHeight;
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle(w, h));
    }
  }

  function drawConnections(ctx, w) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animateHero() {
    const w = heroCanvas.offsetWidth;
    const h = heroCanvas.offsetHeight;
    hCtx.clearRect(0, 0, w, h);

    particles.forEach(p => {
      p.update(w, h);
      p.draw(hCtx);
    });
    drawConnections(hCtx, w);

    requestAnimationFrame(animateHero);
  }

  heroCanvas.addEventListener('mousemove', (e) => {
    const rect = heroCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  heroCanvas.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

  resizeHeroCanvas();
  initParticles();
  animateHero();
  window.addEventListener('resize', () => { resizeHeroCanvas(); initParticles(); });

  // ═════════════════════════════════
  //  NETWORK CANVAS (Coverage)
  // ═════════════════════════════════
  const netCanvas = document.getElementById('networkCanvas');
  const nCtx = netCanvas.getContext('2d');
  let netNodes = [];
  const NET_COUNT = 60;

  function resizeNetCanvas() {
    netCanvas.width = netCanvas.offsetWidth * window.devicePixelRatio;
    netCanvas.height = netCanvas.offsetHeight * window.devicePixelRatio;
    nCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  class NetNode {
    constructor(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 3 + 1.5;
      this.pulse = Math.random() * Math.PI * 2;
      this.isHub = Math.random() < 0.15;
    }
    update(w, h) {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.03;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }
    draw(ctx) {
      const glow = (Math.sin(this.pulse) + 1) / 2;
      const r = this.isHub ? this.r * 1.5 : this.r;
      const alpha = 0.4 + glow * 0.4;

      // Glow ring
      if (this.isHub) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${glow * 0.08})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = this.isHub
        ? `rgba(0, 229, 255, ${alpha})`
        : `rgba(0, 180, 255, ${alpha * 0.7})`;
      ctx.fill();
    }
  }

  function initNetNodes() {
    const w = netCanvas.offsetWidth;
    const h = netCanvas.offsetHeight;
    netNodes = [];
    for (let i = 0; i < NET_COUNT; i++) {
      netNodes.push(new NetNode(w, h));
    }
  }

  function drawNetConnections(ctx) {
    for (let i = 0; i < netNodes.length; i++) {
      for (let j = i + 1; j < netNodes.length; j++) {
        const dx = netNodes[i].x - netNodes[j].x;
        const dy = netNodes[i].y - netNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = (netNodes[i].isHub || netNodes[j].isHub) ? 180 : 110;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.2;
          ctx.beginPath();
          ctx.moveTo(netNodes[i].x, netNodes[i].y);
          ctx.lineTo(netNodes[j].x, netNodes[j].y);
          const isHubConn = netNodes[i].isHub || netNodes[j].isHub;
          ctx.strokeStyle = isHubConn
            ? `rgba(0, 229, 255, ${alpha})`
            : `rgba(0, 180, 255, ${alpha * 0.6})`;
          ctx.lineWidth = isHubConn ? 1 : 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateNetwork() {
    const w = netCanvas.offsetWidth;
    const h = netCanvas.offsetHeight;
    nCtx.clearRect(0, 0, w, h);

    netNodes.forEach(n => {
      n.update(w, h);
      n.draw(nCtx);
    });
    drawNetConnections(nCtx);

    requestAnimationFrame(animateNetwork);
  }

  resizeNetCanvas();
  initNetNodes();
  animateNetwork();
  window.addEventListener('resize', () => { resizeNetCanvas(); initNetNodes(); });

  // ═════════════════════════════════
  //  TESTIMONIAL SLIDER
  // ═════════════════════════════════
  const track = document.getElementById('reviewsTrack');
  const cards = track.querySelectorAll('.review-card');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');
  const dotsContainer = document.getElementById('reviewsDots');

  let currentSlide = 0;
  let slidesPerView = 3;
  let autoplayId;

  function getPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getMaxSlide() {
    return Math.max(0, cards.length - slidesPerView);
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const count = getMaxSlide() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === currentSlide) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(idx) {
    const max = getMaxSlide();
    currentSlide = Math.max(0, Math.min(idx, max));
    const card = cards[0];
    const gap = 24;
    const cardWidth = card.offsetWidth + gap;
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;

    dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() { goTo(currentSlide + 1 > getMaxSlide() ? 0 : currentSlide + 1); }
  function prevSlide() { goTo(currentSlide - 1 < 0 ? getMaxSlide() : currentSlide - 1); }

  prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

  function resetAutoplay() {
    clearInterval(autoplayId);
    autoplayId = setInterval(nextSlide, 5000);
  }

  function initSlider() {
    slidesPerView = getPerView();
    currentSlide = Math.min(currentSlide, getMaxSlide());
    buildDots();
    goTo(currentSlide);
  }

  initSlider();
  resetAutoplay();
  window.addEventListener('resize', initSlider);

  // Touch swipe for slider
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      resetAutoplay();
    }
  }, { passive: true });

  // ─── Contact Form ───
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Message Sent!</span> <i class="fas fa-check"></i>';
    btn.style.background = 'linear-gradient(135deg, #00c853, #009624)';
    btn.style.boxShadow = '0 4px 25px rgba(0,200,83,0.4)';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.style.boxShadow = '';
      contactForm.reset();
    }, 3000);
  });

})();
