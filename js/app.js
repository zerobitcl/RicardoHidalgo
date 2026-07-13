/**
 * Ricardo Hidalgo — Estudio Jurídico
 * Scroll reveal con stagger, nav, header, FAQ
 */

(function () {
  'use strict';

  var STAGGER_DEFAULT = 150;
  var REVEAL_DURATION = 600;

  /* ------------------------------------------
     Utilidades reveal
     ------------------------------------------ */
  function revealElement(el, delay) {
    if (el.classList.contains('is-visible')) return;

    var apply = function () {
      el.style.transitionDelay = delay > 0 ? delay + 'ms' : '';
      el.classList.add('is-visible');

      window.setTimeout(function () {
        el.style.willChange = 'auto';
        el.style.transitionDelay = '';
      }, delay + REVEAL_DURATION + 50);
    };

    if (delay > 0) {
      window.setTimeout(apply, delay);
    } else {
      apply();
    }
  }

  function markReducedMotion(elements) {
    elements.forEach(function (el) {
      el.classList.add('is-visible');
      el.style.willChange = 'auto';
    });
  }

  /* ------------------------------------------
     IntersectionObserver — staggered reveal
     ------------------------------------------ */
  function initScrollReveal() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var staggerGroups = document.querySelectorAll('[data-stagger-group]');
    var standalone = document.querySelectorAll('.reveal:not([data-stagger-group] .reveal)');

    /* Excluir hijos de grupos del selector standalone */
    var groupedChildren = new Set();
    staggerGroups.forEach(function (group) {
      group.querySelectorAll('.reveal').forEach(function (el) {
        groupedChildren.add(el);
      });
    });

    standalone = Array.from(document.querySelectorAll('.reveal')).filter(function (el) {
      return !groupedChildren.has(el);
    });

    if (prefersReduced) {
      markReducedMotion(document.querySelectorAll('.reveal'));
      return;
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    /* Grupos con revelado en cascada */
    staggerGroups.forEach(function (group) {
      var items = group.querySelectorAll('.reveal');
      if (!items.length) return;

      var interval = parseInt(group.getAttribute('data-stagger-interval'), 10) || STAGGER_DEFAULT;

      var groupObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          items.forEach(function (item, index) {
            revealElement(item, index * interval);
          });

          groupObserver.unobserve(entry.target);
        });
      }, observerOptions);

      groupObserver.observe(group);
    });

    /* Elementos sueltos */
    if (standalone.length) {
      var soloObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          revealElement(entry.target, 0);
          soloObserver.unobserve(entry.target);
        });
      }, observerOptions);

      standalone.forEach(function (el) {
        soloObserver.observe(el);
      });
    }
  }

  /* ------------------------------------------
     Header — sombra al scroll
     ------------------------------------------ */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------
     Navegación móvil
     ------------------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.nav-mobile');
    if (!toggle || !nav) return;

    var closeNav = function () {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ------------------------------------------
     FAQ acordeón (landing)
     ------------------------------------------ */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        items.forEach(function (other) {
          other.classList.remove('is-open');
          var otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
          var otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ------------------------------------------
     Smooth scroll para anclas internas
     ------------------------------------------ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var header = document.querySelector('.site-header');
        var offset = header ? header.offsetHeight : 0;

        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      });
    });
  }

  /* ------------------------------------------
     Formulario de contacto (1 paso) → WhatsApp
     ------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var waNumber = form.getAttribute('data-wa') || '56951783266';
    var topic = form.getAttribute('data-topic') || 'asesoría jurídica';
    var success = form.querySelector('.form-success');

    function setError(field, message) {
      var wrap = field.closest('.form-field');
      if (!wrap) return;
      wrap.classList.add('is-invalid');
      var err = wrap.querySelector('.form-error');
      if (err) err.textContent = message;
    }

    function clearError(field) {
      var wrap = field.closest('.form-field');
      if (!wrap) return;
      wrap.classList.remove('is-invalid');
      var err = wrap.querySelector('.form-error');
      if (err) err.textContent = '';
    }

    function isValidPhone(value) {
      var digits = value.replace(/\D/g, '');
      return digits.length >= 8 && digits.length <= 12;
    }

    function isValidEmail(value) {
      if (!value) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }

    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        clearError(el);
      });
      el.addEventListener('change', function () {
        clearError(el);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]');
      var phone = form.querySelector('[name="phone"]');
      var email = form.querySelector('[name="email"]');
      var matter = form.querySelector('[name="matter"]');
      var message = form.querySelector('[name="message"]');
      var valid = true;

      clearError(name);
      clearError(phone);
      if (email) clearError(email);
      if (matter) clearError(matter);
      clearError(message);

      if (!name.value.trim() || name.value.trim().length < 2) {
        setError(name, 'Ingresa tu nombre completo.');
        valid = false;
      }

      if (!isValidPhone(phone.value)) {
        setError(phone, 'Ingresa un teléfono válido (mín. 8 dígitos).');
        valid = false;
      }

      if (email && !isValidEmail(email.value.trim())) {
        setError(email, 'Correo no válido.');
        valid = false;
      }

      if (matter && !matter.value) {
        setError(matter, 'Selecciona el tipo de consulta.');
        valid = false;
      }

      if (!message.value.trim() || message.value.trim().length < 10) {
        setError(message, 'Describe tu caso en al menos 10 caracteres.');
        valid = false;
      }

      if (!valid) {
        var firstInvalid = form.querySelector('.form-field.is-invalid input, .form-field.is-invalid select, .form-field.is-invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var lines = [
        'Hola, necesito ' + topic + ' en Viña del Mar.',
        '',
        'Nombre: ' + name.value.trim(),
        'Teléfono: ' + phone.value.trim()
      ];

      if (email && email.value.trim()) {
        lines.push('Email: ' + email.value.trim());
      }
      if (matter && matter.value) {
        lines.push('Consulta: ' + matter.options[matter.selectedIndex].text);
      }
      lines.push('', 'Caso:', message.value.trim());

      var url = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(lines.join('\n'));

      if (success) {
        success.classList.add('is-visible');
        success.textContent = 'Datos validados. Te redirigimos a WhatsApp…';
      }

      window.setTimeout(function () {
        window.open(url, '_blank', 'noopener,noreferrer');
        form.reset();
      }, 400);
    });
  }

  /* ------------------------------------------
     Init
     ------------------------------------------ */
  function init() {
    initScrollReveal();
    initHeaderScroll();
    initMobileNav();
    initFaq();
    initSmoothAnchors();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
