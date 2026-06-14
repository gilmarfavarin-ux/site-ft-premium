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

/* Mark active nav link */
const currentPage = location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
document.querySelectorAll('.nav a, .mobile-nav a').forEach(a => {
  const href = a.getAttribute('href').split('/').pop();
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
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
        msgEl.className = 'form-msg success';
        msgEl.textContent = '✓ Recebemos seu contato! Em breve nossa equipe entrará em contato.';
        msgEl.style.display = 'block';
        form.reset();
      } else throw new Error();
    } catch {
      msgEl.className = 'form-msg error';
      msgEl.textContent = 'Ocorreu um erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.';
      msgEl.style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = 'Quero meu diagnóstico estratégico';
  });
}

/* Smooth scroll for anchor links on same page */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
