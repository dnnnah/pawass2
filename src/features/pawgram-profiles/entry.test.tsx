import React from 'react';
import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SocialPetPicker } from './pet-picker';
it('lleva directamente a configurar la mascota elegida', () => {
 const html=renderToStaticMarkup(<SocialPetPicker pets={[{id:'luna',name:'Luna',species:'gato',published:false}]} />);
 expect(html).toContain('/mascotas/luna/pawgram');
 expect(html).toContain('Crear perfil de Luna');
 expect(html).toContain('Todavía no está en Pawgram');
});
it('distingue los perfiles ya publicados', () => {
 const html=renderToStaticMarkup(<SocialPetPicker pets={[{id:'luna',name:'Luna',species:'gato',published:true}]} />);
 expect(html).toContain('Gestionar a Luna');
 expect(html).toContain('Perfil publicado');
});
