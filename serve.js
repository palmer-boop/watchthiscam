// Local server for the preview folder: node serve.js [port]
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, 'dist');
const port = process.argv[2] || process.env.PORT || 5195;
const types = {
  // No charset here: cam pages are Latin-1 and blog pages UTF-8, each page's own meta tag decides.
  '.html': 'text/html', '.php': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
};
const clean = s => s.replace(/[<>:"|?*\\]/g, '_').slice(0, 120);

// Same naming the downloader used: pages with a query were saved as name@query.ext
function candidates(p, query) {
  const file = p.endsWith('/') ? p + 'index.html' : p;
  const out = [];
  if (query) {
    const ext = path.extname(file);
    out.push(file.slice(0, file.length - ext.length) + '@' + clean(query) + (ext || '.html'));
  }
  out.push(file);
  if (!path.extname(file)) out.push(file + '/index.html');
  return out;
}

http.createServer((req, res) => {
  const [rawPath, query] = req.url.split('?');
  let p;
  try { p = decodeURIComponent(rawPath); } catch { p = rawPath; }
  for (const c of candidates(p, query)) {
    const file = path.join(root, c);
    if (!file.startsWith(root)) break;
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      if (!path.extname(p) && !p.endsWith('/') && c.endsWith('/index.html')) { res.writeHead(301, { Location: p + '/' }); return res.end(); }
      res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      return fs.createReadStream(file).pipe(res);
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<p style="font-family:Arial">This page was not saved by the Wayback Machine. <a href="/start.html">Back to the start page</a></p>');
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
