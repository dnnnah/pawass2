import { appendFileSync, readFileSync } from 'node:fs';

const values = new Map(readFileSync(0, 'utf8').split(/\r?\n/).flatMap((line) => {
  const match = /^([A-Z_]+)=(.*)$/.exec(line);
  if (!match) return [];
  return [[match[1], match[2].replace(/^"|"$/g, '')]];
}));
const apiUrl = values.get('API_URL');
const anonKey = values.get('ANON_KEY');
const serviceRoleKey = values.get('SERVICE_ROLE_KEY');
const envFile = process.env.GITHUB_ENV;

if (!apiUrl || !anonKey || !serviceRoleKey || !envFile) {
  throw new Error('Supabase local no entregó todas las variables esperadas para CI.');
}
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(apiUrl).hostname)) {
  throw new Error('El workflow solo acepta una URL local de Supabase.');
}

process.stdout.write(`::add-mask::${serviceRoleKey}\n`);
appendFileSync(envFile, [
  `NEXT_PUBLIC_SUPABASE_URL=${apiUrl}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${anonKey}`,
  `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
  `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000`,
  '',
].join('\n'));
