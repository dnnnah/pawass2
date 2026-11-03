/** A new document bypasses any private-route response prefetched before login. */
export async function passwordLogin(
  authenticate: () => Promise<{ error: Error | null; data: { session: object | null } }>,
  replaceDocument: (path: string) => void,
) {
  const { error, data } = await authenticate();
  if (error) throw error;
  if (!data.session) throw new Error('No se creó la sesión. Intenta iniciar de nuevo.');
  replaceDocument('/mascotas');
}
