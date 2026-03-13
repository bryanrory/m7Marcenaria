// M7 Marcenaria - Premium Scripts
(function () {
  'use strict';

  // ========================================
  // HEADER - scroll effect
  // ========================================
  const header = document.getElementById('header');
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 60);
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ========================================
  // MOBILE MENU
  // ========================================
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const navBackdrop = document.getElementById('navBackdrop');

  function openMenu() {
    menuToggle.classList.add('active');
    nav.classList.add('open');
    navBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuToggle.classList.remove('active');
    nav.classList.remove('open');
    navBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', function () {
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  navBackdrop.addEventListener('click', closeMenu);

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // ========================================
  // ACTIVE NAV LINK on scroll
  // ========================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ========================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // ========================================
  var animElements = document.querySelectorAll('[data-anim]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    animElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ========================================
  // COUNTER ANIMATION for stats
  // ========================================
  var counters = document.querySelectorAll('[data-count]');
  var counterDone = new Set();

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counterDone.has(entry.target)) {
            counterDone.add(entry.target);
            animateCounter(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ========================================
  // SMOOTH PARALLAX on hero (subtle)
  // ========================================
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = 'scale(1.05) translateY(' + scrollY * 0.15 + 'px)';
      }
    }, { passive: true });
  }
})();
