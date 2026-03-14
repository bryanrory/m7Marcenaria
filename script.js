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
  function initAnimations() {
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
  }

  initAnimations();

  // ========================================
  // COUNTER ANIMATION for stats
  // ========================================
  var counters = document.querySelectorAll('[data-count]');
  var counterDone = new Set();

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 2000;
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

  // ========================================
  // SUPABASE - Load dynamic data
  // ========================================
  if (typeof supabase !== 'undefined') {
    loadSiteData();
  }

  async function loadSiteData() {
    try {
      await Promise.all([loadSiteSettings(), loadAmbientes()]);
    } catch (err) {
      console.error('Error loading site data:', err);
    }
  }

  // Load site settings
  async function loadSiteSettings() {
    try {
      var { data } = await supabase.from('site_settings').select('*').limit(1).single();
      if (!data) return;

      // Logo
      if (data.logo_url) {
        var logo = document.getElementById('siteLogo');
        if (logo) logo.src = data.logo_url;
      }

      // Hero image
      if (data.hero_image_url) {
        var heroImg = document.getElementById('heroImg');
        if (heroImg) heroImg.src = data.hero_image_url;
        var ctaBg = document.getElementById('ctaBg');
        if (ctaBg) ctaBg.src = data.hero_image_url;
      }

      // About image
      if (data.about_image_url) {
        var aboutImg = document.getElementById('aboutImg');
        if (aboutImg) aboutImg.src = data.about_image_url;
      }

      // WhatsApp
      if (data.whatsapp) {
        var waUrl = 'https://wa.me/' + data.whatsapp;
        var navWa = document.getElementById('navWhatsapp');
        if (navWa) navWa.href = waUrl;
        var floatWa = document.getElementById('whatsappFloat');
        if (floatWa) floatWa.href = waUrl;
        var socialWa = document.getElementById('socialWhatsapp');
        if (socialWa) socialWa.href = waUrl;
        var footerTel = document.getElementById('footerTelefone');
        if (footerTel) footerTel.href = waUrl;
        var contatoTel = document.getElementById('contatoTelefone');
        if (contatoTel) contatoTel.href = waUrl;

        // Format phone for display
        var phone = data.whatsapp;
        if (phone.length >= 13) {
          var formatted = '(' + phone.slice(2,4) + ') ' + phone.slice(4,5) + ' ' + phone.slice(5,9) + '-' + phone.slice(9);
          if (contatoTel) contatoTel.querySelector('p').textContent = formatted;
          if (footerTel) footerTel.textContent = formatted;
        }
      }

      // Email
      if (data.email) {
        var contatoEmail = document.getElementById('contatoEmail');
        if (contatoEmail) {
          contatoEmail.href = 'mailto:' + data.email;
          contatoEmail.querySelector('p').textContent = data.email;
        }
        var footerEmail = document.getElementById('footerEmail');
        if (footerEmail) {
          footerEmail.href = 'mailto:' + data.email;
          footerEmail.textContent = data.email;
        }
      }

      // Social
      if (data.instagram) {
        var ig = document.getElementById('socialInstagram');
        if (ig) ig.href = data.instagram;
      }
      if (data.facebook) {
        var fb = document.getElementById('socialFacebook');
        if (fb) fb.href = data.facebook;
      }

      // TikTok - add icon if URL exists
      if (data.tiktok) {
        var socialContainer = document.getElementById('footerSocial');
        if (socialContainer && !document.getElementById('socialTiktok')) {
          var tiktokLink = document.createElement('a');
          tiktokLink.href = data.tiktok;
          tiktokLink.target = '_blank';
          tiktokLink.setAttribute('aria-label', 'TikTok');
          tiktokLink.className = 'social-icon';
          tiktokLink.id = 'socialTiktok';
          tiktokLink.innerHTML = '<span class="social-icon-inner"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></span>';
          socialContainer.appendChild(tiktokLink);
        }
      }

      // Endereco
      if (data.endereco) {
        var contatoEnd = document.getElementById('contatoEndereco');
        if (contatoEnd) {
          contatoEnd.querySelector('p').innerHTML = data.endereco.replace(/,\s*/g, '<br>');
        }
        var footerEnd = document.getElementById('footerEndereco');
        if (footerEnd) {
          footerEnd.innerHTML = data.endereco.replace(/,\s*/g, '<br>');
        }
      }

      // Horario
      if (data.horario_funcionamento) {
        var horario = document.getElementById('contatoHorario');
        if (horario) {
          horario.querySelector('p').textContent = data.horario_funcionamento;
        }
      }
    } catch (err) {
      console.error('Settings load error:', err);
    }
  }

  // Load environments for gallery
  async function loadAmbientes() {
    try {
      var { data, error } = await supabase
        .from('environments')
        .select('*')
        .eq('show_on_home', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      var galeria = document.getElementById('galeriaAmbientes');
      if (!galeria) return;

      if (!data || data.length === 0) {
        galeria.innerHTML = '<p style="text-align:center;color:var(--gray-500);grid-column:1/-1;padding:40px 0">Em breve nossos trabalhos.</p>';
        return;
      }

      galeria.innerHTML = '';
      data.forEach(function (env, index) {
        var card = document.createElement('a');
        card.href = 'ambiente.html?id=' + env.id;
        card.className = 'card';
        card.setAttribute('data-anim', '');
        if (index > 0) card.style.transitionDelay = (index * 0.15) + 's';

        card.innerHTML =
          '<div class="card-img">' +
            '<img src="' + (env.cover_image_url || '') + '" alt="' + env.name + '">' +
            '<div class="card-overlay">' +
              '<div class="card-overlay-content">' +
                '<span class="card-category">' + env.name + '</span>' +
                '<span class="card-overlay-btn">Ver Projetos</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="card-info">' +
            '<h3>' + env.name + '</h3>' +
            '<p>Projetos exclusivos</p>' +
          '</div>';

        galeria.appendChild(card);
      });

      // Re-init animations for new elements
      initAnimations();
    } catch (err) {
      console.error('Ambientes load error:', err);
    }
  }
})();
