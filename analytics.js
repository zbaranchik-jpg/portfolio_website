/* Portfolio custom events for PostHog.
   Loaded on every page; each handler decides whether it applies.
   Pageviews and autocapture come from PostHog itself — nothing here touches them. */
(function () {
  'use strict';

  /* ---------- localhost / preview guard ---------- */
  // Custom events are production-only, so local work doesn't pollute the funnels.
  var host = location.hostname;
  var isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]' ||
    host === '' ||
    location.protocol === 'file:' ||
    /\.local$/.test(host) ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (isLocal) return;

  /* ---------- helpers ---------- */
  // cleanUrls is on, so the live path is /case-automation while the markup
  // still links to case-automation.html. Strip the extension either way.
  function slugOf(path) {
    var s = String(path || '').split('?')[0].split('#')[0];
    s = s.substring(s.lastIndexOf('/') + 1);
    return s.replace(/\.html$/, '');
  }

  // The four case slugs, mapped to the same names the .mw-title links use.
  var CASE_NAMES = {
    'case-automation': 'Automation Revamp',
    'case-equipment': 'Equipment Tracking',
    'case-nowyouknow': 'NowYouKnow',
    'case-phone-plans': 'Phone Plans page revamp'
  };

  var pagePath = location.pathname;
  var currentCase = CASE_NAMES[slugOf(pagePath)] || null;

  function capture(event, props) {
    if (window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture(event, props);
    }
  }

  // Which region of the page a link sits in, for the `location` property.
  function regionOf(el) {
    if (el.closest('.site-head')) return 'nav';
    if (el.closest('.site-foot')) return 'footer';
    if (el.closest('.btn-row')) return 'hero';
    return 'body';
  }

  /* ---------- case_open ---------- */
  if (currentCase) {
    capture('case_open', { case_name: currentCase, page_path: pagePath });
  }

  /* ---------- case_scroll_50 / case_scroll_75 ---------- */
  // Flags live in this closure, which is recreated on every page load. Every
  // navigation here is a real document load (site.js animates, then sets
  // window.location), so one closure == one page view and each threshold
  // can only ever fire once.
  if (currentCase) {
    var sent50 = false;
    var sent75 = false;
    var ticking = false;

    function depth() {
      var doc = document.documentElement;
      var full = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
      if (full <= window.innerHeight) return 100; // nothing to scroll
      return ((window.pageYOffset + window.innerHeight) / full) * 100;
    }

    function check() {
      ticking = false;
      var pct = depth();
      if (!sent50 && pct >= 50) {
        sent50 = true;
        capture('case_scroll_50', { case_name: currentCase, page_path: pagePath });
      }
      if (!sent75 && pct >= 75) {
        sent75 = true;
        capture('case_scroll_75', { case_name: currentCase, page_path: pagePath });
      }
      if (sent50 && sent75) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check(); // a short page is already past both thresholds on load
  }

  /* ---------- click events ---------- */
  // Capture phase, so this runs before site.js's own document click handler
  // (which calls preventDefault and runs the veil transition before navigating).
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;

    if (a) {
      var href = a.getAttribute('href') || '';

      // cv_click — the CV PDF, in the nav, the mobile menu, and the hero button.
      if (/Zhenya_Baranchik_CV_2026\.pdf$/i.test(href)) {
        capture('cv_click', { location: regionOf(a), page_path: pagePath });
        return;
      }

      // linkedin_click
      if (href.indexOf('linkedin.com') !== -1) {
        capture('linkedin_click', { location: regionOf(a), page_path: pagePath });
        return;
      }

      // email_click
      if (href.indexOf('mailto:') === 0) {
        capture('email_click', { location: regionOf(a), page_path: pagePath });
        return;
      }

      // next_case_click — a .mw-title link inside the "More work" section.
      if (currentCase && a.closest('.next-proj')) {
        var to = CASE_NAMES[slugOf(href)];
        if (to) {
          capture('next_case_click', {
            from_case: currentCase,
            to_case: to,
            page_path: pagePath
          });
        }
      }
      return;
    }

    // next_case_click — the rest of the card. site.js makes the whole
    // .mw-card clickable via data-href, not just the title link.
    var card = e.target.closest ? e.target.closest('.next-proj [data-href]') : null;
    if (card && currentCase) {
      var toCard = CASE_NAMES[slugOf(card.getAttribute('data-href'))];
      if (toCard) {
        capture('next_case_click', {
          from_case: currentCase,
          to_case: toCard,
          page_path: pagePath
        });
      }
    }
  }, true);
})();
