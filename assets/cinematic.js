/* ==========================================================================
   النادرية — محرّك التجربة السينمائية
   Original cinematic engine: preloader, fullscreen nav, atmosphere, motion.
   ========================================================================== */
(function () {
  'use strict';

  var isEn = document.documentElement.lang === 'en';
  var isRTL = document.documentElement.dir === 'rtl';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var SECTION_LABELS = isEn
    ? { home: 'Home', story: 'About', region: 'Asir', ayah: 'Qur’an', products: 'Products', benefits: 'Benefits', features: 'Why us', gallery: 'Gallery', values: 'Values', faq: 'FAQ', contact: 'Contact' }
    : { home: 'الرئيسية', story: 'من نحن', region: 'عسير', ayah: 'الآية', products: 'منتجاتنا', benefits: 'الفوائد', features: 'ما يميزنا', gallery: 'المعرض', values: 'قيمنا', faq: 'الأسئلة', contact: 'تواصل معنا' };

  var AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  function toArabicDigits(n) {
    return String(n).replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; });
  }
  function fromArabicDigits(s) {
    return s.replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
  }

  /* =========================================================
     1. Preloader
     ========================================================= */
  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) { document.body.classList.remove('loading'); startHero(); return; }

    var bar = pre.querySelector('.pre-bar i');
    var num = pre.querySelector('.pre-num');
    var pct = 0;
    var settled = false;

    var tick = setInterval(function () {
      pct = Math.min(pct + Math.random() * 13 + 4, 92);
      paint(pct);
    }, 130);

    function paint(v) {
      var r = Math.round(v);
      if (bar) bar.style.width = r + '%';
      if (num) num.textContent = (isEn ? r : toArabicDigits(r)) + '٪';
    }

    function finish() {
      if (settled) return;
      settled = true;
      clearInterval(tick);
      paint(100);
      setTimeout(function () {
        pre.classList.add('done');
        document.body.classList.remove('loading');
        startHero();
        setTimeout(function () { pre.remove(); }, 900);
      }, 420);
    }

    if (document.readyState === 'complete') setTimeout(finish, 650);
    else window.addEventListener('load', function () { setTimeout(finish, 450); });
    setTimeout(finish, 5000); // hard safety net
  }

  /* =========================================================
     2. Hero: word split + entrance
     ========================================================= */
  function splitHeadline() {
    var h1 = document.querySelector('.hero h1');
    if (!h1 || h1.dataset.split) return;
    h1.dataset.split = '1';

    var frag = document.createDocumentFragment();
    var idx = 0;

    function wrap(node) {
      var box = document.createElement('span');
      box.className = 'rw';
      var inner = document.createElement('span');
      inner.style.setProperty('--wd', (idx * 0.075).toFixed(3) + 's');
      idx++;
      inner.appendChild(node);
      box.appendChild(inner);
      return box;
    }

    [].slice.call(h1.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          frag.appendChild(wrap(document.createTextNode(p)));
        });
      } else if (node.nodeName === 'BR') {
        frag.appendChild(node.cloneNode());
      } else {
        frag.appendChild(wrap(node.cloneNode(true)));
      }
    });

    h1.innerHTML = '';
    h1.appendChild(frag);
    h1.classList.add('reveal-words');
  }

  function startHero() {
    var h1 = document.querySelector('.hero h1');
    if (h1) h1.classList.add('go');
    document.body.classList.add('hero-ready');
    var rail = document.querySelector('.progress-rail');
    if (rail) setTimeout(function () { rail.classList.add('on'); }, 500);
    honorDeepLink();
  }

  // A URL like /#products can't jump on load because the preloader locks
  // scrolling while it is up — replay the jump once scrolling is restored.
  function honorDeepLink() {
    var hash = location.hash;
    if (!hash || hash.length < 2) return;
    var target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return; }
    if (!target) return;
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 90);
  }

  /* =========================================================
     3. Atmosphere canvas — drifting motes
     ========================================================= */
  function initCanvas() {
    if (reduce) return;
    var cv = document.getElementById('heroCanvas');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var motes = [];
    var COLORS = ['#8DC63F', '#3BB54A', '#2BA8A0', '#35A8E0', '#7C5CA8', '#F7941D'];
    var running = true;

    function size() {
      // measure defensively: layout may not be settled on first pass
      var host = cv.parentElement || cv;
      var r = cv.getBoundingClientRect();
      w = Math.round(r.width) || host.clientWidth || window.innerWidth;
      h = Math.round(r.height) || host.clientHeight || window.innerHeight;
      if (!w || !h) return false;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      return true;
    }

    function build() {
      var count = Math.round(Math.min(Math.max(w * h / 22000, 26), 70));
      motes = [];
      for (var i = 0; i < count; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.4 + 0.7,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -(Math.random() * 0.24 + 0.06),
          a: Math.random() * 0.35 + 0.12,
          tw: Math.random() * Math.PI * 2,
          c: COLORS[(Math.random() * COLORS.length) | 0]
        });
      }
    }

    var queued = false;
    function frame() {
      queued = false;
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx;
        m.y += m.vy;
        m.tw += 0.018;
        if (m.y < -12) { m.y = h + 10; m.x = Math.random() * w; }
        if (m.x < -12) m.x = w + 10;
        if (m.x > w + 12) m.x = -10;
        var alpha = m.a * (0.62 + 0.38 * Math.sin(m.tw));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.c;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      pump();
    }

    function pump() {
      if (queued || !running) return;
      queued = true;
      requestAnimationFrame(frame);
    }

    if (!size()) requestAnimationFrame(size);
    window.addEventListener('load', function () { size(); pump(); });
    pump();
    window.addEventListener('resize', debounce(function () { size(); pump(); }, 200));
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      pump();
    });
  }

  /* =========================================================
     4. Hero parallax (scroll + pointer)
     ========================================================= */
  function initParallax() {
    if (reduce) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var mts = hero.querySelector('.hero-mountains');
    var cv = hero.querySelector('.hero-canvas');
    var txt = hero.querySelector('.hero-text');
    var logo = hero.querySelector('.hero-logo');
    var mx = 0, my = 0, tx = 0, ty = 0, ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var vh = window.innerHeight;
        if (y < vh * 1.2) {
          if (mts) mts.style.transform = 'translate3d(0,' + (y * 0.16) + 'px,0)';
          if (cv) cv.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0)';
          var fade = Math.max(0, 1 - y / (vh * 0.75));
          if (txt) { txt.style.transform = 'translate3d(0,' + (y * 0.1) + 'px,0)'; txt.style.opacity = fade; }
          if (logo) { logo.style.opacity = fade; }
        }
        ticking = false;
      });
    }

    function onMove(e) {
      var cx = (e.clientX / window.innerWidth - 0.5);
      var cy = (e.clientY / window.innerHeight - 0.5);
      mx = cx * 16; my = cy * 12;
    }

    function loop() {
      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;
      if (logo) logo.style.setProperty('--px', tx.toFixed(2) + 'px');
      if (mts) mts.style.setProperty('--px', (-tx * 0.7).toFixed(2) + 'px');
      if (logo) logo.style.translate = tx.toFixed(2) + 'px ' + ty.toFixed(2) + 'px';
      requestAnimationFrame(loop);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (fine) { window.addEventListener('mousemove', onMove, { passive: true }); requestAnimationFrame(loop); }
  }

  /* =========================================================
     5. Fullscreen nav overlay
     ========================================================= */
  function initNav() {
    var btn = document.getElementById('menuBtn');
    var ov = document.getElementById('navOverlay');
    if (!btn || !ov) return;

    function setOrigin() {
      var r = btn.getBoundingClientRect();
      var ox = ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(1);
      var oy = ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(1);
      ov.style.setProperty('--ox', ox + '%');
      ov.style.setProperty('--oy', oy + '%');
    }

    function open() {
      setOrigin();
      document.body.classList.add('menu-open');
      btn.setAttribute('aria-expanded', 'true');
      ov.querySelectorAll('.nav-links a').forEach(function (a, i) {
        a.style.setProperty('--nd', (0.18 + i * 0.06).toFixed(2) + 's');
      });
    }
    function close() {
      document.body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function () {
      document.body.classList.contains('menu-open') ? close() : open();
    });

    ov.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var id = href.charAt(0) === '#' ? href.slice(1) : '';
      var target = id ? document.getElementById(id) : null;

      if (!target) {
        // external / language / tel links: just close and let them navigate
        a.addEventListener('click', close);
        return;
      }

      // In-page links: the browser cancels the jump because closing the menu
      // restores body scrolling in the same tick. Scroll manually instead.
      a.addEventListener('click', function (e) {
        e.preventDefault();
        close();
        // small timeout (not rAF — that is frozen in background tabs) so the
        // body regains its scrolling box before we move it
        setTimeout(function () {
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', '#' + id);
        }, 60);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) close();
    });
    window.addEventListener('resize', debounce(setOrigin, 200));
  }

  /* =========================================================
     6. Scroll progress rail
     ========================================================= */
  function initRail() {
    var fill = document.getElementById('railFill');
    var label = document.getElementById('railLabel');
    if (!fill) return;
    var secs = [].slice.call(document.querySelectorAll('section[id]'));
    var ticking = false;

    function update() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        fill.style.height = (p * 100).toFixed(1) + '%';

        var mid = window.innerHeight / 2, cur = null;
        for (var i = 0; i < secs.length; i++) {
          var r = secs[i].getBoundingClientRect();
          if (mid >= r.top && mid < r.bottom) { cur = secs[i].id; break; }
        }
        if (cur && label && label.dataset.cur !== cur) {
          label.dataset.cur = cur;
          label.style.opacity = '0';
          setTimeout(function () {
            label.textContent = SECTION_LABELS[cur] || cur;
            label.style.opacity = '1';
          }, 200);
        }
        document.body.classList.toggle('hero-active', window.scrollY < window.innerHeight * 0.72);
        ticking = false;
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', debounce(update, 200));
    update();
  }

  /* =========================================================
     7. Reveal on scroll (mask-up)
     ========================================================= */
  function initReveals() {
    var els = document.querySelectorAll('.mask-up');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* =========================================================
     8. Card 3D tilt
     ========================================================= */
  function initTilt() {
    if (reduce || !fine) return;
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.style.perspective = '900px';
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' +
          (-py * 7).toFixed(2) + 'deg) translateY(-8px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* =========================================================
     9. Magnetic buttons
     ========================================================= */
  function initMagnetic() {
    if (reduce || !fine) return;
    document.querySelectorAll('.mag').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* =========================================================
     10. Stat counters
     ========================================================= */
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    var targets = [];
    document.querySelectorAll('.stat b').forEach(function (b) {
      var raw = fromArabicDigits(b.textContent.trim());
      var m = raw.match(/^(\d+)(\D*)$/);
      if (m) targets.push({ el: b, to: parseInt(m[1], 10), suffix: m[2] || '' });
    });
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = targets.filter(function (x) { return x.el === en.target; })[0];
        io.unobserve(en.target);
        if (!t || reduce) return;
        var start = performance.now(), dur = 1400;
        function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var v = Math.round(t.to * eased);
          t.el.textContent = (isEn ? v : toArabicDigits(v)) + t.suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    targets.forEach(function (t) { io.observe(t.el); });
  }

  /* =========================================================
     11. Custom cursor
     ========================================================= */
  function initCursor() {
    if (!fine || reduce) return;
    var c = document.querySelector('.cursor');
    if (!c) return;
    var dot = c.querySelector('.cur-dot');
    var ring = c.querySelector('.cur-ring');
    var x = 0, y = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    }, { passive: true });

    (function loop() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('a,button,summary,.tilt');
      document.body.classList.toggle('cur-hot', !!t);
    });
  }

  /* =========================================================
     12. Back to top
     ========================================================= */
  function initToTop() {
    var b = document.getElementById('toTop');
    if (!b) return;
    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', function () {
      b.classList.toggle('on', window.scrollY > window.innerHeight * 1.3);
    }, { passive: true });
  }

  /* ---------- utils ---------- */
  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ---------- boot ---------- */
  function boot() {
    document.body.classList.add('loading');
    splitHeadline();
    initPreloader();
    initCanvas();
    initParallax();
    initNav();
    initRail();
    initReveals();
    initTilt();
    initMagnetic();
    initCounters();
    initCursor();
    initToTop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
