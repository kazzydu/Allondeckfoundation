/**
 * analytics.js — PostHog product analytics, consent-gated.
 *
 * Loads ONLY after the visitor chooses "Accept all" in the cookie banner
 * (localStorage aoh_cookie_consent === 'all', or the 'aoh-consent' event),
 * exactly like GTM/AdSense under Google Consent Mode. Nothing is sent before
 * that. Privacy choices, deliberate:
 *   - autocapture off (we send named events only), session recording off
 *     (many members are under 18), no email/name ever sent — people are
 *     identified by their platform id with role/country as the only properties.
 *   - window.aohTrack(name, props) is the single way pages emit events; it
 *     queues until PostHog is ready and is a no-op without consent. It also
 *     mirrors to dataLayer so existing GTM funnels keep working.
 */
(function () {
  var KEY = 'phc_tsQwcKsYieFCbdiwFFhqbvEHuJzmJ3rg6xFJyMaiVSuT';
  var HOST = 'https://us.i.posthog.com';
  var ready = false, queue = [], loading = false;

  function consented() { try { return localStorage.getItem('aoh_cookie_consent') === 'all'; } catch (e) { return false; } }
  function session() { try { return JSON.parse(localStorage.getItem('aoh_session') || sessionStorage.getItem('aoh_session') || 'null') || {}; } catch (e) { return {}; } }

  function load() {
    if (loading || ready) return; loading = true;
    /* Official posthog-js snippet (stubs the API until array.js arrives). */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionManager persistence sessionRecording captureException loadToolbar".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(KEY, {
      api_host: HOST,
      persistence: 'localStorage+cookie',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      person_profiles: 'identified_only',
      loaded: function (ph) {
        ready = true;
        var s = session();
        var id = s.id || s.coach_id || s.player_id || null;
        if (id) { try { ph.identify(String(id), { role: s.role || null, country: s.country || null }); } catch (e) {} }
        else if (s.role) { try { ph.register({ role: s.role }); } catch (e) {} }
        while (queue.length) { var q = queue.shift(); try { ph.capture(q[0], q[1]); } catch (e) {} }
      }
    });
  }

  window.aohTrack = function (name, props) {
    props = props || {};
    try { window.dataLayer = window.dataLayer || []; var p = { event: name }; for (var k in props) if (props[k] != null) p[k] = props[k]; window.dataLayer.push(p); } catch (e) {}
    if (!consented()) return;
    if (ready && window.posthog) { try { window.posthog.capture(name, props); } catch (e) {} }
    else { queue.push([name, props]); if (queue.length > 50) queue.shift(); load(); }
  };

  if (consented()) load();
  else document.addEventListener('aoh-consent', function (e) { if (e && e.detail === 'all') load(); });
})();
