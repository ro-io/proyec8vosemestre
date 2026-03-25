// ===================================================
//  IDE — Ingeniería Digital Empresarial
//  main.js — Interacciones y animaciones
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  // -----------------------------------------------
  // 1. NAVBAR — Scroll effect & scroll tracking
  // -----------------------------------------------
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--gold)';
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);

  // -----------------------------------------------
  // 2. MENÚ HAMBURGER (Mobile)
  // -----------------------------------------------
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let menuOpen = false;

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);

    // Animar el hamburger
    const spans = hamburger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      document.body.style.overflow = 'hidden';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
      document.body.style.overflow = '';
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
      document.body.style.overflow = '';
    });
  });

  // -----------------------------------------------
  // 3. SCROLL REVEAL — Intersection Observer
  // -----------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');
  const revealCards = document.querySelectorAll('.reveal-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Cards with staggered delay
  const cardObserver = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        delay += 80;
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealCards.forEach(card => cardObserver.observe(card));

  // -----------------------------------------------
  // 4. SMOOTH SCROLL — Navigation links
  // -----------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.offsetTop - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // -----------------------------------------------
  // 5. FORMULARIO DE CONTACTO
  // -----------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn-submit');
      const btnText = btn.querySelector('span');
      const originalText = btnText.textContent;

      // Estado de carga
      btnText.textContent = 'Enviando...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      // Simular envío (aquí conectar con backend real)
      setTimeout(() => {
        btnText.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '';
        contactForm.reset();

        formSuccess.style.display = 'block';
        setTimeout(() => {
          formSuccess.style.display = 'none';
        }, 5000);
      }, 1500);
    });
  }

  // -----------------------------------------------
  // 6. PARALLAX sutil en hero bg text
  // -----------------------------------------------
  const heroBgText = document.querySelector('.hero-bg-text');

  if (heroBgText) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBgText.style.transform = `translateY(calc(-50% + ${scrolled * 0.15}px))`;
      }
    });
  }

  // -----------------------------------------------
  // 7. PORTFOLIO ITEMS — Hover overlay efecto
  // -----------------------------------------------
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  portfolioItems.forEach(item => {
    const img = item.querySelector('.portfolio-img');

    item.addEventListener('mouseenter', () => {
      if (img) img.style.transform = 'scale(1.03)';
      if (img) img.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    item.addEventListener('mouseleave', () => {
      if (img) img.style.transform = 'scale(1)';
    });
  });

  // -----------------------------------------------
  // 8. CONTADOR animado en estadísticas
  // -----------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(element, target, duration = 1500) {
    const isPlus = element.textContent.includes('+');
    const cleanTarget = parseInt(target.replace('+', ''));
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * cleanTarget);
      element.textContent = (isPlus ? '+' : '') + current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const originalText = el.textContent.trim();
        animateCounter(el, originalText);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => counterObserver.observe(num));

});