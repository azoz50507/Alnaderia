/* ==========================================================================
   مزرعة ومشاتل النادرية — طبقة التحليلات (GA4 + أحداث مخصّصة)
   Privacy-first: GA4 تُحمّل فقط بعد موافقة صريحة من الزائر.
   ========================================================================== */
(function () {
  'use strict';

  /* ============================================================
     ⬇️  الإعداد الوحيد: ضع معرّف القياس هنا (Measurement ID)
     من Google Analytics 4:  Admin → Data Streams → Web → G-XXXXXXXXXX
     ============================================================ */
  var GA4_ID = 'G-E9FTE2BBHQ';
  /* ============================================================ */

  var isEn = document.documentElement.lang === 'en';
  var DEBUG = /[?&]debug=analytics/.test(location.search);
  var CONSENT_KEY = 'naderia_consent_v1';
  var configured = GA4_ID && GA4_ID.indexOf('XXXX') === -1;

  var consent = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch (e) {}

  var counters = { whatsapp: 0, orders: 0, faq: 0, scroll: 0 };
  var sectionTime = {};
  var dwellLast = { id: null, ts: 0 };

  var LABELS = isEn
    ? { home: 'Home', story: 'Story', region: 'Asir', ayah: 'Ayah', products: 'Products', benefits: 'Benefits', features: 'Why us', gallery: 'Gallery', values: 'Values', faq: 'FAQ', contact: 'Contact' }
    : { home: 'الرئيسية', story: 'القصة', region: 'عسير', ayah: 'الآية', products: 'المنتجات', benefits: 'الفوائد', features: 'المميزات', gallery: 'المعرض', values: 'القيم', faq: 'الأسئلة', contact: 'التواصل' };

  /* ---------- GA4 loader (async, only after consent) ---------- */
  function loadGA() {
    if (!configured || window.gtag) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA4_ID, { send_page_view: true });
  }

  /* ---------- unified track() ---------- */
  function track(name, params) {
    params = params || {};
    params.lang = isEn ? 'en' : 'ar';
    if (window.gtag && consent === 'granted') gtag('event', name, params);
    if (DEBUG) debugPush(name, params);
  }
  window.naderiaTrack = track;

  /* ---------- event wiring ---------- */
  function wireEvents() {
    // WhatsApp & per-product order clicks
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      a.addEventListener('click', function () {
        counters.whatsapp++;
        var card = a.closest('.prod-card');
        if (card) {
          var h = card.querySelector('h3');
          var name = h ? h.textContent.trim() : '';
          counters.orders++;
          track('order_click', { item_name: name, method: 'whatsapp' });
        } else {
          var ctx = a.classList.contains('wa-float') ? 'float'
            : a.closest('.hero') ? 'hero'
            : a.closest('.header') ? 'header'
            : a.closest('.mobile-nav') ? 'mobile_nav'
            : a.closest('.contact') ? 'contact'
            : a.closest('.faq') ? 'faq' : 'other';
          track('whatsapp_click', { context: ctx });
        }
        if (DEBUG) debugRefresh();
      });
    });

    // FAQ opens
    document.querySelectorAll('.faq-item').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        counters.faq++;
        var q = d.querySelector('summary');
        track('faq_open', { question: q ? q.textContent.trim() : '' });
        if (DEBUG) debugRefresh();
      });
    });

    // language switch
    document.querySelectorAll('a.lang-switch').forEach(function (a) {
      a.addEventListener('click', function () { track('lang_switch', { to: isEn ? 'ar' : 'en' }); });
    });

    // hero secondary CTA
    var explore = document.querySelector('.hero .btn-ghost');
    if (explore) explore.addEventListener('click', function () { track('cta_click', { cta: 'explore_products' }); });

    // gallery photo opens
    document.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('#galleryGrid a');
      if (g) track('gallery_view', { photo: g.getAttribute('href') });
    });

    // section views (fire once, low threshold so tall sections register too)
    if ('IntersectionObserver' in window) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !seen[en.target.id]) {
            seen[en.target.id] = true;
            track('section_view', { section: en.target.id });
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
    }

    // dwell time via viewport-midpoint sampler (robust for any section height)
    var sections = [].slice.call(document.querySelectorAll('section[id]'));
    setInterval(sampleDwell, 1000);
    window.addEventListener('scroll', sampleDwell, { passive: true });
    function sampleDwell() {
      var now = performance.now();
      if (dwellLast.id) sectionTime[dwellLast.id] = (sectionTime[dwellLast.id] || 0) + (now - dwellLast.ts);
      var mid = window.innerHeight / 2, cur = null;
      for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].getBoundingClientRect();
        if (mid >= rect.top && mid < rect.bottom) { cur = sections[i].id; break; }
      }
      dwellLast = { id: cur, ts: now };
      if (DEBUG) debugRefresh();
    }

    // scroll depth milestones
    var marks = [25, 50, 75, 100], hit = {};
    window.addEventListener('scroll', function () {
      var pct = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
      if (pct > counters.scroll) counters.scroll = Math.min(pct, 100);
      marks.forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = true; track('scroll_depth', { percent: m }); } });
      if (DEBUG) debugRefresh();
    }, { passive: true });
  }

  function computeTop() {
    var top = '—', max = 0;
    Object.keys(sectionTime).forEach(function (k) {
      if (sectionTime[k] > max) { max = sectionTime[k]; top = k; }
    });
    return LABELS[top] || top;
  }

  /* ---------- consent banner ---------- */
  function showConsent() {
    var bar = document.createElement('div');
    bar.className = 'consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', isEn ? 'Privacy consent' : 'موافقة الخصوصية');
    bar.innerHTML = isEn
      ? '<p>We use privacy-friendly analytics (Google Analytics) to understand what visitors enjoy — anonymous usage only, no personal data. <a href="/en/privacy.html">Learn more</a>.</p>'
        + '<div class="consent-btns"><button class="c-no" type="button">Decline</button><button class="c-yes" type="button">Accept</button></div>'
      : '<p>نستخدم أدوات تحليلات (Google Analytics) لفهم ما يعجب الزوّار — استخدام مجهول الهوية فقط، بدون أي بيانات شخصية. <a href="/privacy.html">تفاصيل الخصوصية</a>.</p>'
        + '<div class="consent-btns"><button class="c-no" type="button">رفض</button><button class="c-yes" type="button">أوافق</button></div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('in'); });
    bar.querySelector('.c-yes').addEventListener('click', function () { setConsent('granted'); close(); });
    bar.querySelector('.c-no').addEventListener('click', function () { setConsent('denied'); close(); });
    function close() { bar.classList.remove('in'); setTimeout(function () { bar.remove(); }, 500); }
  }

  function setConsent(v) {
    consent = v;
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    if (v === 'granted') loadGA();
    if (DEBUG) {
      var hs = document.querySelector('.ndbg-h span');
      if (hs) hs.textContent = configured
        ? (v === 'granted' ? 'GA4 ●' : (isEn ? 'declined' : 'مرفوض'))
        : (isEn ? 'demo — no ID yet' : 'تجريبي — بلا معرّف');
      debugRefresh();
    }
  }

  /* ---------- live debug overlay (owner only, ?debug=analytics) ---------- */
  var dbgStats, dbgTop, dbgFeed;
  function buildDebug() {
    var p = document.createElement('div');
    p.className = 'ndbg';
    var state = configured ? (consent === 'granted' ? 'GA4 ●' : (isEn ? 'awaiting consent' : 'بانتظار الموافقة')) : (isEn ? 'demo — no ID yet' : 'تجريبي — بلا معرّف');
    p.innerHTML =
      '<div class="ndbg-h"><b>📊 ' + (isEn ? 'Analytics Lab' : 'مختبر التحليلات') + '</b><span>' + state + '</span></div>'
      + '<div class="ndbg-stats" id="nStats"></div>'
      + '<div class="ndbg-top" id="nTop"></div>'
      + '<div class="ndbg-feed" id="nFeed"></div>'
      + '<div class="ndbg-note">' + (isEn ? 'Preview mode — visible to you only' : 'وضع المعاينة — يظهر لك أنت فقط') + '</div>';
    document.body.appendChild(p);
    dbgStats = p.querySelector('#nStats');
    dbgTop = p.querySelector('#nTop');
    dbgFeed = p.querySelector('#nFeed');
    debugRefresh();
  }

  function debugRefresh() {
    if (!dbgStats) return;
    var tiles = isEn
      ? [['WhatsApp', counters.whatsapp], ['Orders', counters.orders], ['FAQ', counters.faq], ['Scroll', counters.scroll + '%']]
      : [['واتساب', counters.whatsapp], ['طلبات', counters.orders], ['أسئلة', counters.faq], ['تصفّح', counters.scroll + '%']];
    dbgStats.innerHTML = tiles.map(function (x) { return '<div><b>' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join('');
    dbgTop.innerHTML = '<span>' + (isEn ? '👁 Most viewed' : '👁 الأكثر مشاهدة') + '</span><b>' + computeTop() + '</b>';
  }

  function debugPush(name, params) {
    debugRefresh();
    if (!dbgFeed) return;
    var row = document.createElement('div');
    row.className = 'nrow';
    var t = new Date().toLocaleTimeString(isEn ? 'en-US' : 'ar-SA', { hour12: false });
    var d = params.item_name || params.context || params.question || params.section || params.cta || params.photo;
    if (params.percent != null) d = params.percent + '%';
    d = d ? String(d) : '';
    if (d.length > 20) d = d.slice(0, 20) + '…';
    row.innerHTML = '<span class="nt">' + t + '</span><span class="nn">' + name + '</span><span class="nd">' + d + '</span>';
    dbgFeed.insertBefore(row, dbgFeed.firstChild);
    while (dbgFeed.children.length > 7) dbgFeed.removeChild(dbgFeed.lastChild);
    if (row.animate) row.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 250, easing: 'ease' });
  }

  /* ---------- init ---------- */
  function init() {
    wireEvents();
    if (DEBUG) buildDebug();
    if (consent === 'granted') loadGA();
    else if (consent !== 'denied') showConsent();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
