// Run with server environment only. Never expose this key to a browser.
import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';
import { cleanWithClient } from '../src/features/pawgram-posts/cleanup.ts';
nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Configura Supabase y su clave privada de servidor.');
const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const done = await cleanWithClient(admin);
console.log(done ? 'Cola social procesada.' : 'Quedan archivos pendientes; vuelve a ejecutar la limpieza.');
if (!done) process.exitCode = 1;
