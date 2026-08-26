/* ============================================================
   Zhenya Baranchik — Portfolio · shared interactions
   All effects degrade gracefully + respect prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- always land at the top on load (no browser scroll restore) ---------- */
  // The hero's scroll-linked portrait zoom reads window.scrollY on first paint,
  // so a restored scroll position would leave it mid-animation.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) {
    window.scrollTo(0, 0);
    addEventListener('load', function () { if (!location.hash) window.scrollTo(0, 0); });
  }

  /* ---------- header scroll state ---------- */
  var head = $('.site-head');
  function onScroll() { if (head) head.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- progressive header blur ---------- */
  // A single backdrop-filter is uniform; the Figma spec ramps the blur from 6px
  // at the top to 0 at the bottom edge. Stacking 8 top-anchored strips of
  // decreasing height makes their blurs accumulate upward, and the mask on each
  // keeps the seams invisible.
  var hbg = head && head.querySelector('.head-bg');
  if (hbg && !hbg.children.length) {
    for (var hi = 0, HN = 8; hi < HN; hi++) {
      var hl = document.createElement('i');
      hl.className = 'hb-l';
      hl.style.height = ((1 - hi / HN) * 100).toFixed(1) + '%';
      hl.style.webkitBackdropFilter = hl.style.backdropFilter = 'blur(2px)';
      hl.style.webkitMaskImage = hl.style.maskImage = 'linear-gradient(to bottom,#000 0,#000 40%,transparent 100%)';
      hbg.appendChild(hl);
    }
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = $$('.reveal, .clip');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- hero word reveal ---------- */
  function splitWords(el) {
    if (!el) return;
    var text = el.getAttribute('data-text');
    if (text == null) return;
    el.innerHTML = '';
    // tokens like {italic words} render in serif-italic accent
    var parts = text.split(/(\{[^}]+\})/g);
    parts.forEach(function (part) {
      if (!part) return;
      var italic = false, str = part;
      if (part[0] === '{') { italic = true; str = part.slice(1, -1); }
      str.split(/(\s+)/).forEach(function (tok) {
        if (tok === '') return;
        if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'word';
        var inner = document.createElement('span');
        if (italic) inner.className = 'serif-i accent';
        inner.textContent = tok;
        w.appendChild(inner); el.appendChild(w);
      });
    });
  }
  var heroDisplay = $('.h-display[data-text]');
  splitWords(heroDisplay);
  if (heroDisplay) {
    var fireHero = function () { heroDisplay.classList.add('go'); };
    if (reduce) { fireHero(); }
    else {
      // staggered rise
      var inners = $$('.word > span', heroDisplay);
      inners.forEach(function (sp, i) { sp.style.transitionDelay = (0.05 + i * 0.045) + 's'; });
      // rAF can be throttled while the iframe is offscreen — back it with a timeout
      requestAnimationFrame(function () { requestAnimationFrame(fireHero); });
      setTimeout(fireHero, 220);
    }
  }

  /* ---------- smooth anchor scroll ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- number count-up ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var dec = (String(end).split('.')[1] || '').length;
    if (reduce) { el.textContent = pre + end.toFixed(dec) + suf; return; }
    var dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = pre + end.toFixed(dec) + suf;
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else { counters.forEach(countUp); }
  }

  /* ---------- reading progress (case pages) ---------- */
  var prog = $('.reading-progress');
  if (prog) {
    var onProg = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      prog.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onProg, { passive: true }); onProg();
  }

  /* ---------- cursor-follow project preview ---------- */
  var preview = $('.cursor-preview');
  var previewSlot = preview ? $('image-slot', preview) : null;
  var rows = $$('.work-row[data-preview]');
  // Project heroes now live as files (the sidecar was retired to keep drops
  // reliable), so the hover preview points the slot straight at the file.
  var HERO_SRC = {
    'nyk-hero': 'assets/nyk-hero-new.webp',
    'auto-hero': 'assets/slot-auto-hero.webp',
    'equip-hero': 'assets/slot-equip-hero.webp'
  };
  if (preview && previewSlot && rows.length && fine && !reduce) {
    var px = window.innerWidth / 2, py = window.innerHeight / 2, cx = px, cy = py, active = false;
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var id = row.getAttribute('data-preview');
        if (id) {
          previewSlot.setAttribute('id', id);
          if (HERO_SRC[id]) previewSlot.setAttribute('src', HERO_SRC[id]);
        }
        active = true; preview.classList.add('on');
      });
      row.addEventListener('mouseleave', function () { active = false; preview.classList.remove('on'); });
    });
    window.addEventListener('mousemove', function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
    (function loop() {
      cx += (px - cx) * 0.14; cy += (py - cy) * 0.14;
      if (preview) preview.style.left = cx + 'px', preview.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- custom cursor dot ---------- */
  if (fine && !reduce && !$('.cursor-dot')) {
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var lbl = document.createElement('span'); lbl.className = 'cursor-ringlabel'; lbl.textContent = 'View';
    dot.appendChild(lbl); document.body.appendChild(dot); document.body.classList.add('has-cursor');
    var dx = window.innerWidth / 2, dy = window.innerHeight / 2, tx = dx, ty = dy;
    window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function dl() { dx += (tx - dx) * 0.28; dy += (ty - dy) * 0.28; dot.style.transform = 'translate(' + (dx - dot.offsetWidth / 2) + 'px,' + (dy - dot.offsetHeight / 2) + 'px)'; requestAnimationFrame(dl); })();
    document.addEventListener('mouseover', function (e) {
      var v = e.target.closest('[data-cursor="view"]');
      var l = e.target.closest('a,button,.work-row');
      if (v) {
        // data-cursor-icon="wave" swaps the label for the masked hand glyph;
        // a bare "↗" label gets its own larger type scale.
        var wave = v.getAttribute('data-cursor-icon') === 'wave';
        var label = wave ? '' : (v.getAttribute('data-cursor-label') || 'View');
        dot.classList.add('ring');
        dot.classList.toggle('wave', wave);
        dot.classList.toggle('arrow', label === '↗');
        lbl.textContent = label;
      } else { dot.classList.remove('ring'); dot.classList.remove('wave'); dot.classList.remove('arrow'); lbl.textContent = ''; }
      dot.style.opacity = '1';
    });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) dot.style.opacity = '0'; });
    document.documentElement.addEventListener('mouseleave', function () { dot.style.opacity = '0'; });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || 0.3;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + mx * strength + 'px,' + my * strength + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- page transition veil ---------- */
  // Veil defaults to HIDDEN (translateY(-100%)). We only cover on OUTGOING
  // navigation — never on load — so a page that loads in a background tab can
  // never get stuck behind a frozen veil.
  var veil = document.createElement('div'); veil.className = 'veil'; document.body.appendChild(veil);
  function isInternal(a) {
    var href = a.getAttribute('href');
    if (!href || a.target === '_blank' || a.hasAttribute('data-no-transition')) return false;
    if (href[0] === '#' || /^(mailto:|tel:|https?:)/.test(href)) return false;
    return /\.html($|\?|#)/.test(href) || href === '/';
  }
  function go(href) {
    if (reduce) { window.location.href = href; return; }
    veil.style.transition = 'none'; veil.style.transform = 'translateY(100%)';
    setTimeout(function () { veil.style.transition = ''; veil.style.transform = 'translateY(0)'; }, 20);
    setTimeout(function () { window.location.href = href; }, 560);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !isInternal(a)) return;
    e.preventDefault();
    go(a.getAttribute('href'));
  });
  // whole-row navigation — clicking the image navigates too, but the image-slot's
  // own editing controls (browse / replace / remove / reframe) are left alone.
  $$('[data-href]').forEach(function (row) {
    row.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var path = (e.composedPath && e.composedPath()) || [];
      for (var i = 0; i < path.length; i++) {
        var n = path[i];
        if (!n || n.nodeType !== 1) continue;
        if (n.tagName === 'BUTTON') return;
        if (n.getAttribute && n.getAttribute('data-act')) return;
        if (n.classList && (n.classList.contains('empty') ||
            n.classList.contains('spill') || n.classList.contains('handle'))) return;
      }
      var slot = e.target.closest('image-slot');
      if (slot && (slot.hasAttribute('data-reframe') || !slot.hasAttribute('data-filled'))) return;
      go(row.getAttribute('data-href'));
    });
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { veil.style.transition = 'none'; veil.style.transform = 'translateY(-100%)'; }
  });

  /* ---------- auto-fit content images to their true aspect ratio ---------- */
  // Every content image (.figure image-slot) sizes its box to the image's own
  // natural ratio, so nothing is cropped and no grey backing shows below the
  // rounded corner. This is what resolves the fixed heights the media classes
  // carry. Personas (.avatar) and work-card thumbs (.mw-media) are not .figure,
  // so they keep their fixed frames.
  function fitSlot(slot) {
    var sr = slot.shadowRoot;
    if (!sr) return;
    var img = sr.querySelector('img');
    if (!img) return;
    if (slot._fitBound) return;
    slot._fitBound = true;
    var apply = function () {
      if (img.naturalWidth && img.naturalHeight) {
        slot.style.display = 'block';
        slot.style.width = '100%';
        slot.style.height = 'auto';
        slot.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
      }
    };
    img.addEventListener('load', apply);
    apply();
  }
  function scanFits() { $$('.figure image-slot').forEach(fitSlot); }
  scanFits();
  // the shadow <img> may not exist on the first tick — retry briefly, then stop
  var fitTries = 0;
  var fitTimer = setInterval(function () {
    scanFits();
    if (++fitTries > 20) clearInterval(fitTimer);
  }, 150);
})();
