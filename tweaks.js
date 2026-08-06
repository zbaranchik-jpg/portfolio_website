/* ============================================================
   Tweaks — lightweight in-page control panel (vanilla)
   Owns the host protocol (__activate_edit_mode / __deactivate_edit_mode,
   posts __edit_mode_available / __edit_mode_dismissed). State persists
   in localStorage so a refresh keeps the chosen tweak.
   ============================================================ */
(function () {
  var LS_KEY = 'zb-tweaks-v1';

  /* ---- accent palettes ------------------------------------ */
  var ACCENTS = {
    red:  { '--accent': '#FF41AC', '--accent-deep': '#E01B8E', '--accent-tint': '#FFD8EC' },
    blue: { '--accent': '#1F50E6', '--accent-deep': '#1740C4', '--accent-tint': '#DCE4FF' }
  };

  /* ---- state --------------------------------------------- */
  var state = { accent: 'red' };
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    if (saved && typeof saved === 'object') Object.assign(state, saved);
  } catch (e) {}

  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---- apply --------------------------------------------- */
  function apply() {
    var pal = ACCENTS[state.accent] || ACCENTS.red;
    var root = document.documentElement;
    Object.keys(pal).forEach(function (k) { root.style.setProperty(k, pal[k]); });
  }
  // apply immediately so the page paints with the chosen accent
  apply();

  /* ---- panel UI ------------------------------------------ */
  var panel, segBtns = {};

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'tweaks-panel';
    panel.setAttribute('data-noncommentable', '');
    panel.innerHTML =
      '<div class="tw-head">' +
        '<span class="tw-title">Tweaks</span>' +
        '<button class="tw-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="tw-section">Accent colour</div>' +
      '<div class="tw-seg" role="group">' +
        '<button data-accent="red"><span class="tw-sw" style="background:#FF41AC"></span>Pink</button>' +
        '<button data-accent="blue"><span class="tw-sw" style="background:#1F50E6"></span>Blue</button>' +
      '</div>' +
      '<p class="tw-hint">Recolours every accent across the site - numbers, links, brand mark, cursor and hover states.</p>';

    document.body.appendChild(panel);

    panel.querySelector('.tw-close').addEventListener('click', dismiss);
    panel.querySelectorAll('.tw-seg button').forEach(function (b) {
      var v = b.getAttribute('data-accent');
      segBtns[v] = b;
      b.addEventListener('click', function () {
        state.accent = v;
        persist(); apply(); syncSeg();
      });
    });
    syncSeg();
    injectStyles();
  }

  function syncSeg() {
    Object.keys(segBtns).forEach(function (v) {
      segBtns[v].classList.toggle('on', v === state.accent);
    });
  }

  /* ---- host protocol ------------------------------------- */
  function open() { if (panel) panel.classList.add('open'); }
  function close() { if (panel) panel.classList.remove('open'); }
  function dismiss() {
    close();
    try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
  }

  window.addEventListener('message', function (e) {
    var t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') open();
    else if (t === '__deactivate_edit_mode') close();
  });

  function init() {
    buildPanel();
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  /* ---- styles -------------------------------------------- */
  function injectStyles() {
    if (document.getElementById('tw-styles')) return;
    var css =
      '.tweaks-panel{position:fixed;right:18px;bottom:18px;z-index:120;width:248px;' +
        'background:#fff;border:1px solid rgba(27,23,20,.12);border-radius:16px;' +
        'box-shadow:0 18px 50px -12px rgba(27,23,20,.28),0 2px 8px rgba(27,23,20,.06);' +
        'padding:14px 16px 16px;font-family:var(--sans,system-ui,sans-serif);color:#1B1714;' +
        'opacity:0;transform:translateY(8px) scale(.98);pointer-events:none;' +
        'transition:opacity .22s ease,transform .22s ease;}' +
      '.tweaks-panel.open{opacity:1;transform:none;pointer-events:auto;}' +
      '.tweaks-panel .tw-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}' +
      '.tweaks-panel .tw-title{font-family:var(--display,inherit);font-weight:600;font-size:15px;letter-spacing:-0.01em;}' +
      '.tweaks-panel .tw-close{border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:#A39A8C;padding:0 2px;}' +
      '.tweaks-panel .tw-close:hover{color:#1B1714;}' +
      '.tweaks-panel .tw-section{font-family:var(--mono,monospace);font-size:10.5px;letter-spacing:.12em;' +
        'text-transform:uppercase;color:#A39A8C;margin-bottom:8px;}' +
      '.tweaks-panel .tw-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;}' +
      '.tweaks-panel .tw-seg button{display:flex;align-items:center;justify-content:center;gap:7px;' +
        'border:1px solid rgba(27,23,20,.14);background:#fff;border-radius:10px;padding:9px 8px;cursor:pointer;' +
        'font-size:13.5px;font-weight:500;font-family:inherit;color:#1B1714;transition:border-color .2s,background .2s;}' +
      '.tweaks-panel .tw-seg button:hover{border-color:rgba(27,23,20,.3);}' +
      '.tweaks-panel .tw-seg button.on{border-color:#1B1714;background:#FAF8F4;}' +
      '.tweaks-panel .tw-sw{width:13px;height:13px;border-radius:50%;display:inline-block;' +
        'box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);}' +
      '.tweaks-panel .tw-hint{margin:11px 0 0;font-size:11.5px;line-height:1.45;color:#6F665B;}';
    var s = document.createElement('style');
    s.id = 'tw-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }
})();
