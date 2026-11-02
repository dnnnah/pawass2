export function validatePost(body: string, alt: string) {
  body = body.trim(); alt = alt.trim();
  if (body.length > 1000) throw new Error('El texto admite hasta 1.000 caracteres.');
  if (!alt || alt.length > 500) throw new Error('Describe la foto con entre 1 y 500 caracteres.');
  return { body, alt };
}
