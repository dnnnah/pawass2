import assert from 'node:assert/strict';

// Run against `npm run start`. This does not submit forms or authenticate.
const base = process.env.PAWPASS_CHECK_URL || 'http://127.0.0.1:3000';
const results = [];
async function page(path) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  const html = await response.text();
  results.push({ path, status: response.status, location: response.headers.get('location'), cache: response.headers.get('cache-control') });
  return { response, html };
}
const home = await page('/');
assert.equal(home.response.status, 200);
assert.match(home.html, /name="robots" content="index, follow"/);
assert.match(home.html, /rel="canonical"/);
assert.match(home.html, /Ejemplo ficticio/);
assert.doesNotMatch(home.html, /auth-heading|name="password"/);
assert.match(home.response.headers.get('cache-control'), /no-store/);
const access = await page('/acceso');
assert.match(access.html, /name="robots" content="noindex, nofollow"/);
assert.match(access.html, /Bienvenido de vuelta/);
assert.doesNotMatch(access.html, /Entrar a la cuenta de prueba/);
assert.match(access.response.headers.get('cache-control'), /no-store/);
const signup = await page('/acceso?modo=crear');
assert.match(signup.html, /Confirma tu contraseña/);
for (const path of ['/cuenta', '/mascotas', '/mascotas/ejemplo/carnet', '/mascotas/ejemplo/perdida']) {
  const { response } = await page(path);
  assert.ok([303, 307].includes(response.status));
  assert.equal(new URL(response.headers.get('location'), base).pathname, '/acceso');
}
const reset = await page('/auth/reset-password');
assert.match(reset.html, /name="robots" content="noindex, nofollow"/);
const callback = await page('/auth/callback');
assert.equal(new URL(callback.response.headers.get('location'), base).pathname, '/acceso');
const board = await page('/perdidas');
assert.match(board.html, /name="robots" content="index, follow"/);
const qr = await page('/p/CODIGO-FICTICIO');
assert.match(qr.html, /name="robots" content="noindex/);
const sitemap = await page('/sitemap.xml');
assert.match(sitemap.html, /<loc>[^<]+\/<\/loc>/);
assert.doesNotMatch(sitemap.html, /\/acceso|\/cuenta|\/mascotas|\/p\//);
const robots = await page('/robots.txt');
assert.match(robots.html, /Sitemap: .*\/sitemap.xml/);
assert.doesNotMatch(robots.html, /Disallow: \/(?:acceso|p|cuenta|mascotas)/);
async function initialScripts(html) {
  const paths = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&')))];
  return Promise.all(paths.map(async path => {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200);
    return { path, content: await response.text() };
  }));
}
const [homeScripts, accessScripts] = await Promise.all([initialScripts(home.html), initialScripts(access.html)]);
assert.ok(accessScripts.some(script => script.content.includes('auth-heading')), 'Access must ship AuthPanel');
assert.ok(homeScripts.every(script => !script.content.includes('auth-heading')), 'Home must not ship AuthPanel');
console.log(JSON.stringify({ routes: results, homeScriptCount: homeScripts.length, accessScriptCount: accessScripts.length, homeScriptBytes: homeScripts.reduce((sum, script) => sum + Buffer.byteLength(script.content), 0), accessScriptBytes: accessScripts.reduce((sum, script) => sum + Buffer.byteLength(script.content), 0), authPanelExcludedFromHome: true }, null, 2));
