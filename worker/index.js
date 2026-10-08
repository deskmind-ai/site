// deskmind.dev Worker: serves the static site (dist/) and collects anonymous events at POST /e.
// Events go to Workers Analytics Engine. No cookies, no IP addresses, no user identifiers: a random per-tab id from
// sessionStorage only links events within one visit. Browsers that send Do Not Track send nothing (see public/t.js).
const str = (v, n) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, n);

// One canonical origin. www. and plain http serve the same pages, which Search Console lists as duplicates
// ("备用网页（有适当的规范标记）"), and the assets layer answers /zh with a temporary 307 to /zh/ ("网页会自动重定向").
// Both become permanent redirects to https://deskmind.dev/…/, so Google indexes one URL per page.
const CANONICAL_HOST = 'deskmind.dev';

function canonicalRedirect(url) {
  let target = null;
  if (url.hostname !== CANONICAL_HOST || url.protocol !== 'https:') {
    target = new URL(url);
    target.protocol = 'https:';
    target.hostname = CANONICAL_HOST;
  }
  // Pages end in a slash (Astro's build and the sitemap agree); a path without one and without an extension is a page.
  const last = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
  if (url.pathname !== '/e' && !url.pathname.endsWith('/') && last && !last.includes('.')) {
    target = target || new URL(url);
    target.pathname = url.pathname + '/';
  }
  return target && target.href !== url.href ? Response.redirect(target.href, 301) : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' || request.method === 'HEAD') {
      const redirect = canonicalRedirect(url);
      if (redirect) return redirect;
    }
    if (url.pathname === '/e') {
      if (request.method !== 'POST') return new Response(null, { status: 405 });
      try {
        const b = await request.json();
        const ev = str(b.e, 32);
        if (ev && env.EVENTS) {
          env.EVENTS.writeDataPoint({
            // blob1 event, blob2 path, blob3 where, blob4 label, blob5 ref, blob6 referrer host,
            // blob7 country, blob8 lang, blob9 device, blob10 visit id
            blobs: [ev, str(b.p, 200), str(b.w, 48), str(b.l, 120), str(b.r, 64), str(b.rf, 100),
                    str(request.cf && request.cf.country, 4), str(b.lang, 8), str(b.d, 4), str(b.s, 16)],
            doubles: [Number(b.v) || 0],
            indexes: [ev],
          });
        }
      } catch (_) { /* malformed beacon: ignore */ }
      return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    }
    return env.ASSETS.fetch(request);
  },
};
