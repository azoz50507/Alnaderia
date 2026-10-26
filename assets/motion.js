/* Naderia motion: the hero appear, scroll reveals, photo loading, navigation state,
   the tagline word reveal and the story loops inside the bento cards.
   Follows design-to-motion (website context): intros play once, stories pause off screen,
   reduced motion shows every section in its final state. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rtl = root.dir === 'rtl';
  var hasIO = 'IntersectionObserver' in window;

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  /* Hero appear: header, badge, headline lines, subtext, button, proof line. */
  function heroAppear() {
    document.querySelectorAll('[data-appear]').forEach(function (node, index) {
      node.style.setProperty('--d', (index * 0.06).toFixed(2) + 's');
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('is-ready'); });
    });
  }

  /* Photos: skeleton shimmer until the file is decoded, then blur to sharp once in view. */
  function photos() {
    document.querySelectorAll('.ph').forEach(function (img) {
      var wrap = img.closest('.ph-wrap');
      function settle() {
        img.classList.add('is-loaded');
        if (wrap) window.setTimeout(function () { wrap.classList.add('is-done'); }, 900);
      }
      if (img.complete && img.naturalWidth) settle();
      else {
        img.addEventListener('load', settle, { once: true });
        img.addEventListener('error', function () { if (wrap) wrap.classList.add('is-done'); }, { once: true });
      }
    });
  }

  function staggerBatch(entries) {
    var batch = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var node = entry.target;
      if (node.classList.contains('reveal-card') && !node.style.getPropertyValue('--d')) {
        node.style.setProperty('--d', (batch * 0.085).toFixed(3) + 's');
        batch += 1;
      }
    });
  }

  /* Scroll reveals: sections rise 32px and fade in once; cards rise with a soft blur. */
  function reveals() {
    var nodes = document.querySelectorAll('.reveal, .reveal-card:not([data-story]), .ph');
    if (!hasIO || reduce) {
      nodes.forEach(function (node) { node.classList.add('is-in', 'is-shown'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      staggerBatch(entries);
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(entry.target.classList.contains('ph') ? 'is-shown' : 'is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  /* Navigation: denser pill after scrolling, current section marked, WhatsApp button after the hero. */
  function navigation() {
    var header = document.getElementById('siteHeader');
    var stage = document.querySelector('.hero-stage');
    var whatsapp = document.querySelector('.wa-float');
    if (!hasIO) { if (whatsapp) whatsapp.classList.add('is-shown'); return; }

    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      if (header) header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);

    if (stage && whatsapp) {
      new IntersectionObserver(function (entries) {
        var entry = entries[0];
        whatsapp.classList.toggle('is-shown', !entry.isIntersecting && entry.boundingClientRect.top < 0);
      }).observe(stage);
    }

    var links = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
    var sections = links.map(function (link) { return document.getElementById(link.dataset.spy); }).filter(Boolean);
    var current = null;
    function mark(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (link) {
        if (link.dataset.spy === id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) mark(entry.target.id);
        else if (entry.target.id === current && entry.boundingClientRect.top > 0) mark(null);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* Tagline reveal: each word moves from a muted tone to full colour in reading order. */
  function tagline() {
    var text = document.querySelector('[data-words]');
    if (!text) return;
    var words = [];
    text.querySelectorAll('.tl-line').forEach(function (line) {
      var parts = line.textContent.split(/(\s+)/);
      line.textContent = '';
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { line.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement('span');
        word.className = 'w';
        word.textContent = part;
        line.appendChild(word);
        words.push(word);
      });
    });
    if (reduce) { words.forEach(function (word) { word.classList.add('is-on'); }); return; }
    var ticking = false;
    var lastCount = -1;
    function update() {
      ticking = false;
      var rect = text.getBoundingClientRect();
      var start = window.innerHeight * 0.85;
      var end = window.innerHeight * 0.4;
      var progress = clamp((start - rect.top) / (start - end + rect.height), 0, 1);
      var count = Math.round(progress * words.length);
      if (count === lastCount) return;
      lastCount = count;
      words.forEach(function (word, index) { word.classList.toggle('is-on', index < count); });
    }
    function request() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  /* Story: a message is deleted, retyped glyph by glyph, delivered, and the farm replies. */
  function chatStory(card) {
    var chat = card.querySelector('.chat');
    var typed = card.querySelector('.typed-text');
    var caret = card.querySelector('.caret');
    var reply = card.querySelector('.bubble-in');
    var glyphs = Array.from(typed.textContent);
    var total = glyphs.length;
    var shown = total;
    var deleteStep = 0.02;
    var typeStep = 0.055;
    var clear = 0.5;
    var deleted = clear + total * deleteStep;
    var resume = deleted + 0.6;
    var typedAt = resume + total * typeStep;
    var sentAt = typedAt + 0.3;
    var replyAt = sentAt + 0.5;
    var period = replyAt + 3;
    return function (time) {
      var t = time % period;
      var count;
      if (t < clear) count = total;
      else if (t < deleted) count = Math.ceil(total - (t - clear) / deleteStep);
      else if (t < resume) count = 0;
      else if (t < typedAt) count = Math.floor((t - resume) / typeStep);
      else count = total;
      count = clamp(count, 0, total);
      if (count !== shown) { typed.textContent = glyphs.slice(0, count).join(''); shown = count; }
      var typing = t >= clear && t < typedAt + 0.2;
      var idle = t >= deleted && t < resume;
      caret.style.opacity = !typing ? '0' : idle ? String(Math.floor((t - deleted) * 2) % 2 ? 0 : 1) : '1';
      chat.classList.toggle('ticks-off', t < sentAt);
      reply.classList.toggle('is-off', t < replyAt);
    };
  }

  /* Story: a highlight walks down the list, each detail is checked, then the result appears. */
  function checkStory(card) {
    var rows = Array.prototype.slice.call(card.querySelectorAll('.check-row'));
    var result = card.querySelector('.check-result');
    var start = 0.9;
    var step = 0.7;
    var resultAt = start + rows.length * step + 0.1;
    var period = resultAt + 3.2;
    return function (time) {
      var t = time % period;
      rows.forEach(function (row, index) {
        var on = start + index * step;
        row.classList.toggle('is-active', t >= on && t < on + step);
        row.classList.toggle('is-off', t < on + step * 0.45);
      });
      result.classList.toggle('is-off', t < resultAt);
    };
  }

  /* Story: a pulse leaves the farm and travels node to node; each step lights as it arrives. */
  function routeStory(card) {
    var nodes = Array.prototype.slice.call(card.querySelectorAll('.route-node'));
    var icons = nodes.map(function (node) { return node.querySelector('.node-icon'); });
    var pulse = card.querySelector('.route-pulse');
    var line = card.querySelector('.route-line line');
    var xs = [];
    var y = 24;
    function measure() {
      xs = icons.map(function (icon) { return icon.offsetLeft + icon.offsetWidth / 2; });
      y = icons[0].offsetTop + icons[0].offsetHeight / 2;
    }
    window.addEventListener('resize', measure, { passive: true });
    var hop = 0.8;
    var rest = 0.25;
    var lead = 0.3;
    var count = nodes.length;
    var travelEnd = lead + (count - 1) * (hop + rest);
    var period = travelEnd + 2.4;
    return function (time) {
      if (!xs.length) measure();
      var t = time % period;
      var march = (time * 18) % 10;
      line.style.strokeDashoffset = String(rtl ? march : -march);
      var x;
      var alpha;
      if (t < lead) { x = xs[0]; alpha = t / lead; }
      else if (t < travelEnd) {
        var elapsed = t - lead;
        var segment = Math.min(count - 2, Math.floor(elapsed / (hop + rest)));
        var within = elapsed - segment * (hop + rest);
        var progress = within < hop ? easeInOut(within / hop) : 1;
        x = xs[segment] + (xs[segment + 1] - xs[segment]) * progress;
        alpha = 1;
      } else { x = xs[count - 1]; alpha = clamp(1 - (t - travelEnd) / 0.5, 0, 1); }
      pulse.style.opacity = alpha.toFixed(3);
      pulse.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      nodes.forEach(function (node, index) {
        var arrive = index === 0 ? 0.1 : lead + (index - 1) * (hop + rest) + hop;
        node.classList.toggle('is-lit', t >= arrive && t < arrive + (index === count - 1 ? 1.6 : 1.1));
      });
    };
  }

  /* Story: the sun crosses its arc, the leaves lean toward it, and a new leaf opens at noon. */
  function growStory(card) {
    var sun = card.querySelector('.sun');
    var leaves = Array.prototype.slice.call(card.querySelectorAll('.leaf:not(.leaf-top)'));
    var topLeaf = card.querySelector('.leaf-top');
    var cx = 160;
    var cy = 156;
    var radius = 134;
    var noon = Math.PI / 2;
    var dusk = rtl ? Math.PI : 0;
    var dawn = rtl ? 0 : Math.PI;
    var period = 8;
    return function (time) {
      var t = time % period;
      var angle;
      var alpha;
      if (t < 2.8) { angle = noon + (dusk - noon) * easeInOut(t / 2.8); alpha = clamp((2.8 - t) / 0.6, 0, 1); }
      else if (t < 3.6) { angle = dusk; alpha = 0; }
      else if (t < 6.4) { angle = dawn + (noon - dawn) * easeInOut((t - 3.6) / 2.8); alpha = clamp((t - 3.6) / 0.6, 0, 1); }
      else { angle = noon; alpha = 1; }
      var x = cx + radius * Math.cos(angle);
      var y = cy - radius * Math.sin(angle);
      sun.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      sun.style.opacity = alpha.toFixed(3);
      var lean = Math.cos(angle) * alpha;
      leaves.forEach(function (leaf) {
        var tilt = parseFloat(leaf.dataset.tilt) || 1;
        leaf.style.transform = 'rotate(' + (lean * 9 * tilt).toFixed(2) + 'deg)';
      });
      topLeaf.classList.toggle('is-closed', t >= 2.9 && t < 5.8);
    };
  }

  /* Bento cards rise in at 30% visibility, then each visual acts out its story, offset in reading order. */
  function stories() {
    var builders = { chat: chatStory, check: checkStory, route: routeStory, grow: growStory };
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-story]'));
    if (reduce || !hasIO) { cards.forEach(function (card) { card.classList.add('is-in'); }); return; }
    var list = [];
    cards.forEach(function (card, index) {
      var make = builders[card.dataset.story];
      if (make) list.push({ card: card, run: make(card), t: -index * 0.8, visible: false, startAt: Infinity });
    });
    var frameId = 0;
    var last = 0;
    function frame(now) {
      var dt = Math.min(now - last, 64) / 1000;
      last = now;
      var active = false;
      list.forEach(function (story) {
        if (!story.visible) return;
        active = true;
        if (now < story.startAt) return;
        story.card.classList.add('story-on');
        story.t += dt;
        if (story.t >= 0) story.run(story.t);
      });
      frameId = active ? requestAnimationFrame(frame) : 0;
    }
    var observer = new IntersectionObserver(function (entries) {
      staggerBatch(entries);
      entries.forEach(function (entry) {
        var story = list.find(function (item) { return item.card === entry.target; });
        if (!story) return;
        story.visible = entry.isIntersecting;
        if (entry.isIntersecting && !story.card.classList.contains('is-in')) {
          story.card.classList.add('is-in');
          story.startAt = performance.now() + 1700;
        }
      });
      if (!frameId && list.some(function (story) { return story.visible; })) {
        last = performance.now();
        frameId = requestAnimationFrame(frame);
      }
    }, { threshold: 0.3 });
    list.forEach(function (story) { observer.observe(story.card); });
  }

  function init() {
    photos();
    reveals();
    navigation();
    tagline();
    stories();
    if (reduce) { root.classList.add('is-ready'); return; }
    var started = false;
    function begin() { if (!started) { started = true; heroAppear(); } }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(begin);
    window.setTimeout(begin, 700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
