/* Mobile nav */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

/* Active nav link */
const currentPage = location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
document.querySelectorAll('.nav a, .mobile-nav a').forEach(a => {
  const href = a.getAttribute('href').split('/').pop();
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

/* Scroll animations */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.info-card, .service-card, .case-card, .step-card, .blog-card, .method-step, .value-card, .mvv-card, .trust-item, .result-item, .benefit-item, .faq-list details, .section-intro').forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 4 === 1) el.classList.add('reveal-delay-1');
  if (i % 4 === 2) el.classList.add('reveal-delay-2');
  if (i % 4 === 3) el.classList.add('reveal-delay-3');
  observer.observe(el);
});

/* Contact form */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const msgEl = document.getElementById('form-msg');
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        window.location.href = '/obrigado.html';
      } else throw new Error();
    } catch {
      msgEl.className = 'form-msg error';
      msgEl.textContent = 'Ocorreu um erro ao enviar. Tente pelo WhatsApp: (11) 97391-1674';
      msgEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Quero meu diagnóstico estratégico';
    }
  });
}

/* Smooth scroll for anchor links */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
