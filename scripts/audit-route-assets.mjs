import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { gzipSync } from 'node:zlib';

// Audit emitted production assets without a session or database fixtures.
// Only ancestor layouts/loading boundaries and this page are route entries;
// other pages listed in the RSC manifest are not inherited route styles.
const routes = ['page', 'acceso/page', 'auth/reset-password/page', 'cuenta/page', 'mascotas/page', 'mascotas/[id]/page', 'mascotas/[id]/carnet/page', 'mascotas/[id]/perdida/page', 'perdidas/page', 'perdidas/[code]/page', 'p/[code]/page'];
const features = {
  portada: ['.home_hero', new Set(['page'])],
  acceso: ['.auth-story', new Set(['acceso/page', 'auth/reset-password/page'])],
  carnet: ['.health-panel', new Set(['mascotas/[id]/carnet/page'])],
  cartel: ['.poster-studio', new Set(['mascotas/[id]/perdida/page'])],
  editor: ['.pet-details-editor', new Set(['mascotas/[id]/page'])],
  reporte: ['.lost-report-form', new Set(['mascotas/[id]/perdida/page'])],
  navegacion: ['.app-menu', new Set(['page', 'cuenta/page', 'mascotas/page', 'mascotas/[id]/page', 'mascotas/[id]/carnet/page', 'mascotas/[id]/perdida/page', 'perdidas/page', 'perdidas/[code]/page'])],
  rescate: ['.rescue-card', new Set(['p/[code]/page'])],
};
const rows = [];
const leaks = [];
const missing = [];
for (const route of routes) {
  const context = {};
  vm.runInNewContext(fs.readFileSync(`.next/server/app/${route}_client-reference-manifest.js`, 'utf8'), context);
  const manifest = Object.values(context.__RSC_MANIFEST)[0];
  const ancestors = new Set(['layout', route]);
  const segments = route.split('/').slice(0, -1);
  for (let i = 1; i <= segments.length; i++) {
    const prefix = segments.slice(0, i).join('/');
    ancestors.add(`${prefix}/layout`);
    ancestors.add(`${prefix}/loading`);
  }
  const css = [...new Set(Object.entries(manifest.entryCSSFiles)
    .filter(([entry]) => [...ancestors].some(name => entry.endsWith(`/src/app/${name}`)))
    .flatMap(([, files]) => files.map(file => file.path)))];
  const buffers = css.map(file => fs.readFileSync(path.join('.next', file)));
  const text = Buffer.concat(buffers).toString();
  const loaded = Object.entries(features).filter(([, [selector]]) => text.includes(selector));
  for (const [feature, [, allowed]] of loaded) if (!allowed.has(route)) leaks.push(`${route}: ${feature}`);
  for (const [feature, [selector, allowed]] of Object.entries(features)) if (allowed.has(route) && !text.includes(selector)) missing.push(`${route}: ${feature}`);
  rows.push({ route: route === 'page' ? '/' : `/${route.replace(/\/page$/, '')}`, files: css.length, bytes: buffers.reduce((n, b) => n + b.length, 0), gzip: buffers.reduce((n, b) => n + gzipSync(b).length, 0), features: loaded.map(([name]) => name) });
}
console.log(JSON.stringify({ routes: rows, unexpectedFeatureStyles: leaks, missingFeatureStyles: missing }, null, 2));
if (leaks.length || missing.length) process.exitCode = 1;
