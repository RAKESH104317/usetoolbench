// SEO crawlability quality gate for generated public pages.
// Run after: npm run build (from repository root).
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'frontend', 'dist');
const origin = 'https://usetoolbench.in';
const fail = [];
const exists = p => fs.existsSync(path.join(root, p));
if (!exists('sitemap.xml')) fail.push('Missing sitemap.xml');
if (!exists('robots.txt')) fail.push('Missing robots.txt');
const sitemap = exists('sitemap.xml') ? fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8') : '';
const robots = exists('robots.txt') ? fs.readFileSync(path.join(root, 'robots.txt'), 'utf8') : '';
if (!/Sitemap:\s*https:\/\/usetoolbench\.in\/sitemap\.xml/i.test(robots)) fail.push('robots.txt lacks canonical sitemap reference');
if (!/Disallow:\s*\/admin/i.test(robots)) fail.push('Admin disallow rule missing');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (!urls.length) fail.push('Sitemap has no URLs');
if (new Set(urls).size !== urls.length) fail.push('Duplicate sitemap URLs');
let checked = 0;
for (const url of urls) {
  let parsed;
  try { parsed = new URL(url); } catch { fail.push('Invalid sitemap URL: ' + url); continue; }
  if (parsed.origin !== origin || !parsed.pathname.endsWith('/') || parsed.search || parsed.hash) {
    fail.push('Noncanonical sitemap URL: ' + url); continue;
  }
  if (parsed.pathname.startsWith('/admin')) { fail.push('Admin route in sitemap: ' + url); continue; }
  const file = path.join(root, decodeURIComponent(parsed.pathname.slice(1)), 'index.html');
  if (!fs.existsSync(file)) { fail.push('Missing sitemap target: ' + url); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const desc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)/i)?.[1];
  const canon = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/gi)].map(m => m[1]);
  if (!title) fail.push('Missing title: ' + url);
  if (!desc) fail.push('Missing description: ' + url);
  if (canon.length !== 1 || canon[0] !== url) fail.push('Canonical mismatch: ' + url);
  if (!/max-image-preview:large/i.test(html)) fail.push('Discover image-preview directive missing: ' + url);
  if (!/application\/ld\+json/i.test(html)) fail.push('Missing structured data: ' + url);
  checked++;
}
console.log('Checked ' + checked + ' public sitemap pages.');
if (fail.length) { console.error(fail.slice(0,80).join('\n')); console.error(fail.length + ' SEO errors'); process.exitCode = 1; }
else console.log('SEO discovery quality gate passed.');
