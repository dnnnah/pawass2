import { expect, it } from 'vitest';
import { shouldDisableResponseCaching } from '@/lib/supabase/cache-policy';
it('impide caché del HTML y de las rutas sociales', () => {
  for (const path of ['/pawgram', '/pawgram/mascotas/id', '/pawgram/imagenes/id', '/pawgram/administracion']) expect(shouldDisableResponseCaching(path)).toBe(true);
});
