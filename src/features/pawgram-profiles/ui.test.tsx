import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('./actions', () => ({ prepareProfile: async()=>({ok:false,message:''}), publishProfile: async()=>({ok:false,message:''}), hideProfile: async()=>({ok:false,message:''}) }));
vi.mock('@/features/pawgram-posts/actions', () => ({ createPost: async()=>({ok:false,message:''}), editPost: async()=>({ok:false,message:''}), deletePost: async()=>({ok:false,message:''}) }));
import { ProfileEditor } from './profile-editor';
import { PostManager } from '@/features/pawgram-posts/post-manager';
describe('gestión social accesible', () => {
 it('empieza sin consentimiento y ofrece vista previa separada', () => {
  const html = renderToStaticMarkup(<ProfileEditor petId="pet" hasRescuePhoto={false} profile={null} />);
  expect(html).toContain('Revisar vista previa');
  expect(html).not.toContain('Confirmar y publicar perfil');
  expect(html).not.toContain('checked=""');
  expect(html).not.toContain('QA_PRIVATE_NEVER_PUBLIC');
 });
 it('publicar exige una sola foto y descripción accesible', () => {
  const html=renderToStaticMarkup(<PostManager petId="pet" active posts={[]} />);
  expect(html).toContain('Descripción accesible de la foto');
  expect(html).toMatch(/name="alt"[^>]*required=""/);
  expect(html).not.toContain('multiple=');
 });
 it('un perfil oculto no ofrece el formulario de publicar foto', () => {
  const html=renderToStaticMarkup(<PostManager petId="pet" active={false} posts={[]} />);
  expect(html).not.toContain('type="file"');
 });
});
