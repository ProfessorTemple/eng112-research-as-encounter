/* Research as Encounter: anonymous, aggregate interaction counts.
   Student writing and input values are never read or transmitted.
   Set SITE_CODE to the non-secret site code from your own GoatCounter account.
   Uses count-only image requests, not third-party JavaScript.
   Keep this empty until the instructor has reviewed the provider and enabled collection.
*/
(function () {
  'use strict';

  const SITE_CODE = 'research-as-encounter'; // Example: 'research-encounter' (not a password or API key).
  const OPT_OUT_KEY = 'rae-anonymous-usage-optout-v1';
  const ALLOWED_STAGES = new Set(['begin', 'explore', 'search', 'read', 'journal', 'return', 'biblio', 'writing']);
  const ALLOWED_MEDIA = new Set(['film', 'video', 'audio', 'essay', 'article']);
  const ALLOWED_LENSES = new Set(['ecocriticism', 'environmental-justice', 'neurodiversity', 'phenomenology', 'ecofeminism', 'queer-ecology', 'material-posthumanism', 'place-displacement']);
  const ACTIONS = Object.freeze({
    'start-own': ['starting/own-idea', 'Started with my own idea'],
    'start-help': ['starting/prompt', 'Requested a starting invitation'],
    'starter-next': ['starting/another-prompt', 'Asked for another invitation'],
    'discover-threads': ['discovery/threads', 'Explored possible threads'],
    'generate-search': ['research/build-search', 'Requested database search suggestions'],
    'save-source-note': ['research/note-save-attempt', 'Tried saving a source note'],
    'add-custom-source': ['research/custom-source-attempt', 'Tried adding an outside source'],
    'ws-bib-export': ['export/bibliography', 'Requested bibliography Word export'],
    'ws-essay-export': ['export/final-essay', 'Requested essay Word export'],
    'ws-final-export': ['export/final-essay', 'Requested essay Word export'],
    'download-json': ['export/project-backup', 'Requested project backup'],
    'self-guide-backup': ['export/project-backup', 'Requested project backup'],
    'download-txt': ['export/research-journal', 'Requested research journal export'],
    'import-json': ['backup/restore-opened', 'Opened backup restore'],
    'ws-bold': ['writing/format-bold', 'Used bold formatting'],
    'ws-italic': ['writing/format-italic', 'Used italic formatting']
  });

  const validSite = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/.test(SITE_CODE);
  const doNotTrack = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  let pageRecorded = false;
  const inFlight = new Set();

  function isOptedOut() {
    try { return localStorage.getItem(OPT_OUT_KEY) === 'yes'; }
    catch (_error) { return true; } // When preferences cannot be read, fail closed.
  }

  function active() { return validSite && !doNotTrack && !isOptedOut(); }

  function status() {
    const input = document.getElementById('analytics-optout');
    const message = document.getElementById('analytics-status');
    if (input) {
      input.checked = isOptedOut();
      input.disabled = doNotTrack;
    }
    if (!message) return;
    message.textContent = !validSite
      ? 'Anonymous statistics are not connected yet; no analytics are being sent.'
      : doNotTrack
        ? 'Your browser privacy preference is respected. No usage statistics are being sent.'
        : isOptedOut()
          ? 'Usage statistics are off in this browser. Your writing and backups are unaffected.'
          : 'Anonymous usage counts are on. No writing, searches, names, or personal sources are sent.';
  }

  // Only fixed-count pixels go to the provider; no remote JavaScript can read drafts.
  function sendCount(path, title, isEvent, finished) {
    if (!active()) { if (finished) finished(false); return; }
    const params = new URLSearchParams({
      p: path, t: title, e: isEvent ? '1' : '0', r: '',
      rnd: Math.random().toString(36).slice(2) // Cache-buster, not a visitor ID.
    });
    const pixel = new Image(1, 1);
    pixel.referrerPolicy = 'no-referrer';
    inFlight.add(pixel);
    pixel.onload = () => { inFlight.delete(pixel); if (finished) finished(true); };
    pixel.onerror = () => { inFlight.delete(pixel); if (finished) finished(false); };
    pixel.src = 'https://' + SITE_CODE + '.goatcounter.com/count?' + params.toString();
  }

  function record(path, title) {
    if (!active()) return;
    // Event strings are static or based on approved instructor-curated items.
    if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(path) || path.length > 120) return;
    sendCount(path, title, true);
  }

  function deviceGroup() {
    const ua = navigator.userAgent || '';
    if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) return 'tablet';
    if (/mobi|iphone|ipod|android/i.test(ua)) return 'phone';
    return 'computer';
  }

  function recordPage() {
    if (!active() || pageRecorded) return;
    pageRecorded = true;
    sendCount('/research-as-encounter', 'Research as Encounter', false);
    record('device/' + deviceGroup(), 'Approximate device type');
  }

  function curatedBook(id) {
    if (!/^[a-z0-9-]{1,35}$/.test(id || '')) return null;
    // Only titles in the instructor-supplied, public catalog can become event names.
    if (typeof DATA === 'undefined' || !Array.isArray(DATA.books)) return null;
    return DATA.books.find(book => book.id === id) || null;
  }

  function trackStage(name) {
    if (ALLOWED_STAGES.has(name)) record('stage/' + name, 'Opened ' + name + ' writing section');
  }

  function observeClick(event) {
    if (!active() || !(event.target instanceof Element)) return;
    const node = event.target.closest('button,a');
    if (!node) return;

    const bookRow = node.closest('#book-list [data-analytics-book]');
    if (bookRow) {
      const book = curatedBook(bookRow.getAttribute('data-analytics-book'));
      if (book) {
        const text = (node.textContent || '').trim();
        const verb = node.tagName === 'A' ? 'opened' :
          /take reading notes/i.test(text) ? 'notes' :
          /save to my shelf/i.test(text) ? 'saved' : null;
        if (verb) record('book/' + verb + '/' + book.id, 'Curated book: ' + book.title + ' (' + verb + ')');
      }
      return;
    }

    const mediaRow = node.closest('#media-list [data-analytics-media-kind]');
    if (mediaRow) {
      const kind = mediaRow.getAttribute('data-analytics-media-kind');
      if (ALLOWED_MEDIA.has(kind)) {
        const text = (node.textContent || '').trim();
        const verb = node.tagName === 'A' ? 'opened' :
          /take viewing|take reading/i.test(text) ? 'notes' :
          /save to my shelf/i.test(text) ? 'saved' : null;
        if (verb) record('source/' + kind + '/' + verb, 'Selected a curated ' + kind);
      }
      return;
    }

    if (node.closest('.self-guide-options') && node.dataset.tab) {
      record('starting/' + node.dataset.tab, 'Selected starting area');
      trackStage(node.dataset.tab);
      return;
    }
    if (node.closest('.nav') && node.dataset.tab) {
      trackStage(node.dataset.tab);
      return;
    }
    if (node.classList.contains('journey-step') && node.dataset.step) {
      trackStage(node.dataset.step);
      return;
    }
    if (node.dataset.go && ALLOWED_STAGES.has(node.dataset.go)) {
      trackStage(node.dataset.go);
      return;
    }
    if (node.closest('.transition-guide')) {
      record('navigation/next-step', 'Used optional next-step suggestion');
      return;
    }
    if (node.hasAttribute('data-ws-backup')) {
      record('export/project-backup', 'Requested project backup');
      return;
    }
    const action = ACTIONS[node.id];
    if (action) record(action[0], action[1]);
  }

  function observeChange(event) {
    if (!active() || !(event.target instanceof Element)) return;
    const checkbox = event.target.closest('input[data-lens]');
    if (!checkbox || !checkbox.checked) return;
    const id = checkbox.getAttribute('data-lens');
    const predefined = ALLOWED_LENSES.has(id);
    if (predefined && /^[a-z0-9-]{1,35}$/.test(id))
      record('lens/' + id, 'Selected an optional critical lens');
  }

  function init() {
    const testButton = document.getElementById('analytics-test');
    const testStatus = document.getElementById('analytics-test-result');
    if (testButton) {
      testButton.disabled = !active();
      testButton.addEventListener('click', () => {
        if (!active()) {
          if (testStatus) testStatus.textContent = 'Statistics are switched off or blocked by a privacy preference.';
          return;
        }
        if (testStatus) testStatus.textContent = 'Sending a test count…';
        sendCount('diagnostic/connection-test', 'Connection check (no student data)', true, ok => {
          if (testStatus) testStatus.textContent = ok
            ? 'GoatCounter responded. Refresh its dashboard after about 10 seconds. Look for the connection-test event.'
            : 'The request was blocked or failed. Check Safari content blockers or network restrictions.';
        });
      });
    }
    const preference = document.getElementById('analytics-optout');
    if (preference) preference.addEventListener('change', function () {
      try { localStorage.setItem(OPT_OUT_KEY, preference.checked ? 'yes' : 'no'); }
      catch (_error) { preference.checked = true; }
      if (!preference.checked) recordPage();
      if (testButton) testButton.disabled = !active();
      if (testStatus) testStatus.textContent = '';
      status();
    });
    document.addEventListener('click', observeClick, true);
    document.addEventListener('change', observeChange, true);
    status();
    recordPage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
