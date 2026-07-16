/* مزرعة ومشاتل النادرية — Naderia Farm & Nurseries */
(function () {
  'use strict';

  // Header state on scroll
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  var burger = document.getElementById('burgerBtn');
  var mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Current year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
