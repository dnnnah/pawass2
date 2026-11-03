// Disposable integration fixtures only. No real pets or accounts are modified.
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { writeFile, readFile, unlink } from 'node:fs/promises';
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { socialWebp } from '../src/features/pawgram-posts/image.ts';
import { cleanWithClient } from '../src/features/pawgram-posts/cleanup.ts';
nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !secret) throw new Error('Server Supabase configuration required');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secret, options);
const anon = createClient(url, key, options);
const stateFile = process.env.PAWGRAM_QA_STATE_PATH || '/tmp/pawgram-live-state.json';
const base = process.env.PAWGRAM_QA_BASE_URL || 'http://127.0.0.1:3100';
const mode = process.argv[2];
const check = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
async function cleanup(state) {
  if (state.rescuePath) check(await admin.storage.from('pet-photos').remove([state.rescuePath]));
  for (const person of state.people) check(await admin.auth.admin.deleteUser(person.id));
  assert.equal(await cleanWithClient(admin), true);
  const remaining = check(await admin.from('pawgram_assets').select('id').eq('pet_id', state.petId));
  assert.equal(remaining.length, 0, 'No orphan social assets');
  const reservation = check(await admin.from('public_code_reservations').select('pet_id').eq('code', state.code).single());
  assert.equal(reservation.pet_id, null, 'Rescue code anonymously reserved');
  await unlink(stateFile).catch(() => {});
}
if (mode === 'cleanup') {
  await cleanup(JSON.parse(await readFile(stateFile, 'utf8')));
  console.log('PASS: temporary accounts, posts, paws and files cleaned; code reserved');
} else if (mode === 'setup') {
  const state = { people: [], petId: '', code: '' };
  try {
    for (const role of ['owner', 'other', 'moderator']) {
      const email = `pawgram-qa-${randomUUID()}@example.test`;
      const password = `QA!${randomBytes(24).toString('base64url')}`;
      const created = check(await admin.auth.admin.createUser({ email, password, email_confirm: true }));
      const person = { role, id: created.user.id, email, password };
      state.people.push(person);
      await writeFile(stateFile, JSON.stringify(state), { mode: 0o600 });
    }
    const clients = await Promise.all(state.people.map(async person => {
      const client = createClient(url, key, options); check(await client.auth.signInWithPassword(person)); return client;
    }));
    const [owner, other, moderator] = clients;
    check(await owner.from('profiles').update({ first_name: 'QA temporal', rescue_phone: '+525555550101', whatsapp_phone: '+525555550101' }).eq('id', state.people[0].id));
    const pet = check(await owner.rpc('create_pet_with_code', { p_name: 'Luna · prueba temporal', p_species: 'gato', p_privacy_accepted: true }))[0];
    state.petId = pet.pet_id; state.code = pet.public_code;
    await writeFile(stateFile, JSON.stringify(state), { mode: 0o600 });
    check(await owner.from('pets').update({ microchip: 'QA_PRIVATE_NEVER_PUBLIC' }).eq('id', state.petId));
    assert.equal(check(await anon.rpc('pawgram_public_profile', { p_pet: state.petId })), null);
    const snapshot = { name: 'Luna · prueba temporal', species: 'gato', presentation: 'Una prueba temporal de privacidad. Se eliminará al terminar.' };
    assert.ok((await owner.rpc('pawgram_save_profile', { p_pet: state.petId, p_snapshot: snapshot, p_consent: false, p_photo: null })).error);
    check(await owner.rpc('pawgram_save_profile', { p_pet: state.petId, p_snapshot: snapshot, p_consent: true, p_photo: null }));
    state.assetId = randomUUID(); state.postId = randomUUID();
    const original = await sharp({ create: { width: 720, height: 480, channels: 3, background: '#e2f0f4' } }).composite([{ input: Buffer.from('<svg width="720" height="480"><circle cx="360" cy="230" r="110" fill="#176986"/><circle cx="320" cy="205" r="14" fill="white"/><circle cx="400" cy="205" r="14" fill="white"/><text x="360" y="410" text-anchor="middle" font-size="28" fill="#173b4b">Pawgram · prueba temporal</text></svg>') }]).jpeg().withExif({ IFD0: { Artist: 'QA_PRIVATE_NEVER_PUBLIC' } }).toBuffer();
    const photo = await socialWebp(original); assert.equal((await sharp(photo).metadata()).exif, undefined);
    check(await admin.from('pawgram_assets').insert({ id: state.assetId, pet_id: state.petId, owner_id: state.people[0].id, path: `${state.assetId}.webp` }));
    check(await admin.storage.from('pawgram-photos').upload(`${state.assetId}.webp`, photo, { contentType: 'image/webp', cacheControl: '0' }));
    check(await owner.rpc('pawgram_create_post', { p_id: state.postId, p_pet: state.petId, p_photo: state.assetId, p_body: 'Probando momentos compartidos con privacidad.', p_alt: 'Ilustración azul sencilla sobre un fondo claro, creada para esta prueba temporal.' }));
    assert.ok((await owner.storage.from('pawgram-photos').createSignedUrl(`${state.assetId}.webp`, 60)).error, 'No owner signed URL');
    assert.ok((await anon.storage.from('pawgram-photos').download(`${state.assetId}.webp`)).error, 'No direct anonymous image');
    assert.equal(check(await other.from('pawgram_profiles').select('pet_id').eq('pet_id', state.petId)).length, 0);
    assert.ok((await other.rpc('pawgram_edit_post', { p_id: state.postId, p_body: 'Ataque', p_alt: 'Ataque' })).error);
    assert.ok((await owner.rpc('pawgram_set_paw', { p_post: state.postId, p_present: true })).error);
    await Promise.all(Array.from({ length: 24 }, async () => check(await other.rpc('pawgram_set_paw', { p_post: state.postId, p_present: true }))));
    const feed = check(await anon.rpc('pawgram_feed', { p_post: state.postId }));
    assert.equal(feed[0].paw_count, 1); assert.equal(feed[0].has_paw, false);
    assert.ok(!JSON.stringify(feed).includes('QA_PRIVATE_NEVER_PUBLIC'));
    assert.ok((await anon.from('pawgram_paws').select('*')).error);
    const imageUrl = `${base}/pawgram/imagenes/${state.assetId}`;
    const visibleImage = await fetch(imageUrl); assert.equal(visibleImage.status, 200); assert.ok(visibleImage.headers.get('cache-control').includes('no-store'));
    check(await admin.from('pawgram_admins').insert({ account_id: state.people[2].id }));
    assert.ok((await owner.rpc('pawgram_moderate', { p_kind: 'profile', p_id: state.petId, p_reason: 'No autorizado' })).error);
    check(await moderator.rpc('pawgram_moderate', { p_kind: 'profile', p_id: state.petId, p_reason: 'Revisión temporal de privacidad' }));
    assert.equal((await fetch(imageUrl)).status, 404);
    assert.equal(check(await anon.rpc('pawgram_feed', { p_post: state.postId })).length, 0);
    assert.ok((await other.rpc('pawgram_set_paw', { p_post: state.postId, p_present: true })).error);
    check(await owner.rpc('pawgram_set_published', { p_pet: state.petId, p_published: true }));
    assert.equal(check(await anon.rpc('pawgram_public_profile', { p_pet: state.petId })), null);
    check(await moderator.rpc('pawgram_moderate', { p_kind: 'profile', p_id: state.petId, p_reason: null }));
    assert.equal((await fetch(imageUrl)).status, 200);
    await writeFile(stateFile, JSON.stringify(state), { mode: 0o600 });
    console.log('PASS: real Auth/RLS/Storage, 24 concurrent paws, withdrawal and restoration. Disposable UI fixtures ready.');
  } catch (error) {
    await cleanup(state).catch(() => {});
    throw error;
  }
} else throw new Error('Use setup or cleanup');
