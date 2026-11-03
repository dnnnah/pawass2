import { expect, test } from '@playwright/test';
import { localUserEmail, localUserPassword } from './global-setup';

test('la demo pública muestra solo ejemplos y no activa acciones reales', async ({ page }) => {
  await page.goto('/demo');

  await expect(page.getByRole('heading', { name: 'Una muestra de PawPass' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Mascotas de ejemplo' }).getByRole('article')).toHaveCount(5);
  await expect(page.getByText('Esta muestra no crea cuentas ni modifica registros.')).toBeVisible();
  await expect(page.locator('a[href^="tel:"], a[href^="https://wa.me/"]')).toHaveCount(0);
});

test('la pérdida de demostración advierte que es ficticia y no ofrece contacto activo', async ({ page }) => {
  await page.goto('/demo/mascotas/tacho');

  await expect(page.getByRole('heading', { name: 'Reporte de pérdida · caso ficticio' })).toBeVisible();
  const lostNotice = page.getByRole('region', { name: 'Reporte de pérdida · caso ficticio' });
  await expect(lostNotice.getByRole('alert')).toContainText('Tacho está a salvo');
  await expect(page.getByText('No llames, no escribas y no compartas este aviso como una búsqueda activa.')).toBeVisible();
  await expect(page.getByText('Ningún canal de contacto está activo en esta ficha.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ya está en casa' })).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"], a[href^="https://wa.me/"]')).toHaveCount(0);
});

test('el acceso autenticado local abre las mascotas privadas y protege la ruta ante visitantes @supabase-local', async ({ page }) => {
  await page.goto('/mascotas');
  await expect(page).toHaveURL(/\/acceso(?:\?|$)/);

  await page.getByLabel('Correo electrónico').fill(localUserEmail);
  await page.getByLabel('Contraseña', { exact: true }).fill(localUserPassword);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL(/\/mascotas(?:\?|$)/);
  await expect(page.getByText('Luna de prueba')).toBeVisible();
  await expect(page.getByText('Miso de prueba')).toBeVisible();
});
