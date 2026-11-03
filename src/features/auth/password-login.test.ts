import { expect, it } from 'vitest';
import { passwordLogin } from './password-login';
it('espera la sesión y hace una navegación completa a Mis mascotas', async () => {
  const destinations: string[] = [];
  let finish!: (value: { error: null; data: { session: object } }) => void;
  const response = new Promise<{ error: null; data: { session: object } }>(resolve => { finish = resolve; });
  const login = passwordLogin(() => response, path => destinations.push(path));
  expect(destinations).toEqual([]);
  finish({ error: null, data: { session: { access_token: 'test' } } });
  await login;
  expect(destinations).toEqual(['/mascotas']);
});
it('no navega si las credenciales fallan o no se crea sesión', async () => {
  const destinations: string[] = [];
  await expect(passwordLogin(async()=>({error:new Error('Credenciales inválidas'),data:{session:null}}),path=>destinations.push(path))).rejects.toThrow('Credenciales inválidas');
  await expect(passwordLogin(async()=>({error:null,data:{session:null}}),path=>destinations.push(path))).rejects.toThrow();
  expect(destinations).toEqual([]);
});
