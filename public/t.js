// deskmind.dev events: page views, download / GitHub / model clicks, video, FAQ, code copy, scroll depth, time on page.
// Anonymous: no cookies; a random id in sessionStorage links events within one tab's visit. Do Not Track = nothing sent.
(() => {
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k) || ''; sessionStorage.setItem(k, v); } catch (_) {} return v || ''; };
    let sid = ss('dm_s'); if (!sid) sid = ss('dm_s', Math.random().toString(36).slice(2, 10));
    const q = new URLSearchParams(location.search);
    const qref = q.get('ref') || q.get('utm_source') || '';
    if (qref) ss('dm_ref', qref);
    const ref = qref || ss('dm_ref');
    let rf = ''; try { const h = new URL(document.referrer).hostname; if (h && h !== location.hostname) rf = h; } catch (_) {}
    const base = { lang: document.documentElement.lang || '', r: ref, rf, d: matchMedia('(max-width: 720px)').matches ? 'm' : 'd', s: sid };
    const send = (e, o) => {
      const body = JSON.stringify(Object.assign({ e, p: location.pathname }, base, o || {}));
      try { if (navigator.sendBeacon && navigator.sendBeacon('/e', new Blob([body], { type: 'application/json' }))) return; } catch (_) {}
      fetch('/e', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {});
    };
    window.dmTrack = send;
    send('pv');

    const where = (el) => { const s = el.closest('[id]'); if (s) return s.id; const t = el.closest('header,nav,footer,aside,main'); return t ? t.tagName.toLowerCase() : ''; };
    const kind = (h) => /github\.com\/deskmind-ai\/(app|deskmind)\/releases|\.dmg($|\?)/.test(h) ? 'download'
      : /github\.com/.test(h) ? 'github' : /huggingface\.co/.test(h) ? 'hf' : /modelscope\.cn/.test(h) ? 'modelscope' : '';
    document.addEventListener('click', (ev) => {
      const t = ev.target; if (!t || !t.closest) return;
      const a = t.closest('a[href]');
      if (a) {
        const k = kind(a.href);
        if (k) send('click_' + k, { w: where(a), l: a.href.replace(/^https?:\/\//, '') });
        else if (a.host && a.host !== location.host) send('click_out', { w: where(a), l: a.host });
        else if (/\/docs\//.test(a.pathname) && !/\/docs\//.test(location.pathname)) send('click_docs', { w: where(a), l: a.pathname });
        else if (/\/blog\//.test(a.pathname) && !/\/blog\//.test(location.pathname)) send('click_blog', { w: where(a), l: a.pathname });
        return;
      }
      const b = t.closest('button');
      if (!b) return;
      const label = (b.getAttribute('aria-label') || b.title || b.textContent || '').trim();
      if (/copy|复制/i.test(label) || b.closest('.copy')) send('copy_code', { w: where(b), l: (b.closest('figure,pre,.expressive-code') || b).textContent.trim().slice(0, 60) });
      else if (b.matches('[data-open-modal]')) send('search_open', { w: where(b) });
    }, true);

    document.addEventListener('toggle', (ev) => {
      const d = ev.target;
      if (d && d.tagName === 'DETAILS' && d.open) { const s = d.querySelector('summary'); send('faq_open', { l: s ? s.textContent.trim().slice(0, 80) : '' }); }
    }, true);

    const seen = new Set();
    addEventListener('scroll', () => {
      const h = document.documentElement, pct = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
      for (const m of [25, 50, 75, 100]) if (pct >= m - 1 && !seen.has(m)) { seen.add(m); send('scroll', { v: m }); }
    }, { passive: true });

    document.addEventListener('play', (ev) => {
      const v = ev.target; if (!v || v.tagName !== 'VIDEO') return;
      const name = (v.currentSrc || '').split('/').pop();
      send('video_play', { l: name, w: where(v) });
      if (v.dataset.dmTracked) return; v.dataset.dmTracked = '1';
      const q = new Set();
      v.addEventListener('timeupdate', () => {
        if (!v.duration) return;
        const p = Math.floor(v.currentTime / v.duration * 4) * 25;
        if (p > 0 && !q.has(p)) { q.add(p); send('video_progress', { v: p, l: name }); }
      });
    }, true);

    const t0 = Date.now();
    let left = false;
    addEventListener('pagehide', () => { if (!left) { left = true; send('leave', { v: Math.round((Date.now() - t0) / 1000) }); } });
  } catch (_) {}
})();
