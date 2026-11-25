/* AllONDECK — first-visit cookie consent banner (NDPR/NDPA). Self-contained, no deps.
   Shows once; remembers choice in localStorage + a cookie. "Essential only" is the
   privacy-preserving default action; a future analytics loader can check
   localStorage['aoh_cookie_consent'] === 'all' before running. */
(function () {
  var KEY = 'aoh_cookie_consent';
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}
  // also respect a previously-set cookie (private mode / cleared storage)
  if (/(?:^|;\s*)aoh_cookie_consent=/.test(document.cookie)) return;

  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    document.cookie = 'aoh_cookie_consent=' + v + ';path=/;max-age=15552000;samesite=lax';
    // Google Consent Mode v2 — flip analytics/ads on only when the user accepts all
    try {
      var g = (v === 'all') ? 'granted' : 'denied';
      window.dataLayer = window.dataLayer || [];
      var gt = window.gtag || function () { window.dataLayer.push(arguments); };
      gt('consent', 'update', { ad_storage: g, analytics_storage: g, ad_user_data: g, ad_personalization: g });
    } catch (e) {}
    var el = document.getElementById('aoh-cookie-banner');
    if (el) { el.style.opacity = '0'; setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250); }
    try { document.dispatchEvent(new CustomEvent('aoh-consent', { detail: v })); } catch (e) {}
  }

  function render() {
    if (document.getElementById('aoh-cookie-banner')) return;
    var d = document.createElement('div');
    d.id = 'aoh-cookie-banner';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Cookie consent');
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:720px;margin:0 auto;' +
      'background:#0D1B3E;color:#fff;border:1px solid rgba(201,168,76,.45);border-radius:14px;padding:15px 18px;' +
      'box-shadow:0 12px 44px rgba(0,0,0,.4);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;' +
      'font-size:14px;line-height:1.5;opacity:0;transition:opacity .3s ease';
    d.innerHTML =
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px">' +
        '<div style="flex:1 1 300px;min-width:230px">' +
          '🍪 We use cookies to run AllONDECK (keeping you signed in) and to improve it. ' +
          'See our <a href="https://allondeck.org/privacy.html#cookies" style="color:#E6CB7C;text-decoration:underline">Privacy Policy</a>.' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button type="button" id="aoh-cc-ess" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45);border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13.5px">Essential only</button>' +
          '<button type="button" id="aoh-cc-all" style="background:#C9A84C;color:#0D1B3E;border:none;border-radius:9px;padding:9px 17px;font-weight:800;cursor:pointer;font-size:13.5px">Accept all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.style.opacity = '1'; });
    document.getElementById('aoh-cc-all').addEventListener('click', function () { save('all'); });
    document.getElementById('aoh-cc-ess').addEventListener('click', function () { save('essential'); });
  }

  if (document.body) render();
  else document.addEventListener('DOMContentLoaded', render);
})();
