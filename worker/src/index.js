// wtc-report: collects "this cam is not working" reports from watchthiscam.com cam pages.
// POST /report  {"id":"<cam id>"}  -> counted in KV under r:<id> (kept 60 days). One count per visitor per cam per day.
// Read them with: node research/reports.js   (uses the wrangler CLI, no public read endpoint)
const ORIGINS = ['https://watchthiscam.com', 'https://www.watchthiscam.com', 'http://localhost:5196'];
async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (url.pathname === '/report' && req.method === 'POST') {
      if (!ORIGINS.includes(origin)) return new Response('no', { status: 403, headers: cors });
      let id = ''; try { id = String((JSON.parse(await req.text()) || {}).id || ''); } catch (e) {}
      if (!/^[a-z0-9-]{2,80}$/.test(id)) return new Response('bad id', { status: 400, headers: cors });
      const day = new Date().toISOString().slice(0, 10);
      const who = (await sha((req.headers.get('CF-Connecting-IP') || '') + day)).slice(0, 12);   // not stored in a readable form
      const seenKey = 's:' + id + ':' + who;
      if (await env.REPORTS.get(seenKey)) return new Response('ok', { headers: cors });
      await env.REPORTS.put(seenKey, '1', { expirationTtl: 90000 });
      const key = 'r:' + id; let cur = { n: 0 };
      try { cur = JSON.parse((await env.REPORTS.get(key)) || '{"n":0}'); } catch (e) {}
      cur.n = (cur.n || 0) + 1; cur.last = new Date().toISOString(); cur.first = cur.first || cur.last;
      await env.REPORTS.put(key, JSON.stringify(cur), { expirationTtl: 60 * 86400 });
      return new Response('ok', { headers: cors });
    }
    return new Response('Watch This Cam report collector', { headers: cors });
  },
};
