// Show the cams visitors reported as not working (from the wtc-report Worker's KV), most-reported first.
// node reports.js          list
// node reports.js clear    list, then wipe the reports (after a sweep has dealt with them)
const { execFileSync } = require('child_process'), path = require('path'), fs = require('fs');
const W = 'C:/Users/admin/work/garmin/tides-server/node_modules/wrangler/bin/wrangler.js', cwd = path.join(__dirname, '..', 'worker');
const run = a => execFileSync(process.execPath, [W, ...a], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const keys = JSON.parse(run(['kv', 'key', 'list', '--binding', 'REPORTS', '--remote'])).map(k => k.name);
const ids = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'all-cams.json'))).map(c => c.id));
const rows = keys.filter(k => k.startsWith('r:')).map(k => { let v = {}; try { v = JSON.parse(run(['kv', 'key', 'get', k, '--binding', 'REPORTS', '--remote'])); } catch (e) {} return { id: k.slice(2), ...v }; })
  .sort((a, b) => (b.n || 0) - (a.n || 0));
if (!rows.length) console.log('No reports.');
for (const r of rows) console.log(`${String(r.n || 0).padStart(3)}x  ${r.id}${ids.has(r.id) ? '' : '  (not a cam on the site)'}  last ${String(r.last || '').slice(0, 16)}`);
if (process.argv[2] === 'clear') { for (const k of keys) run(['kv', 'key', 'delete', k, '--binding', 'REPORTS', '--remote']); console.log('cleared', keys.length, 'keys'); }
