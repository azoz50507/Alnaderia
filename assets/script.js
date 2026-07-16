/* مزرعة ومشاتل النادرية — Naderia Farm & Nurseries */
(function () {
  'use strict';

  var isEnglish = document.documentElement.lang === 'en';

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

  // Gallery auto-loader: shows images/1.jpg, 2.jpg... (or .png/.webp)
  // as soon as they exist in the images/ folder. Numbering must be
  // sequential starting from 1; loading stops at the first gap.
  var galleryGrid = document.getElementById('galleryGrid');
  var gallerySection = document.getElementById('gallery');
  if (galleryGrid && gallerySection) {
    var base = (isEnglish ? '../' : '') + 'images/';
    var exts = ['jpg', 'jpeg', 'png', 'webp'];
    var MAX_PHOTOS = 12;

    var loadPhoto = function (n) {
      if (n > MAX_PHOTOS) return;
      var tryExt = function (i) {
        if (i >= exts.length) return; // gap found — stop the sequence
        var img = new Image();
        var src = base + n + '.' + exts[i];
        img.onload = function () {
          img.alt = isEnglish
            ? 'Photo from Naderia Farm'
            : 'صورة من مزرعة النادرية';
          img.loading = 'lazy';
          var link = document.createElement('a');
          link.href = src;
          link.target = '_blank';
          link.rel = 'noopener';
          link.appendChild(img);
          galleryGrid.appendChild(link);
          gallerySection.hidden = false;
          loadPhoto(n + 1);
        };
        img.onerror = function () { tryExt(i + 1); };
        img.src = src;
      };
      tryExt(0);
    };
    loadPhoto(1);
  }

  // Current year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
