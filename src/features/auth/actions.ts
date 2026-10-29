'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getSiteUrl, isLocalTestLoginEnabled } from '@/lib/supabase/env';

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect('/');
}

export async function signInAsDevTestAccount() {
  if (!isLocalTestLoginEnabled()) redirect('/');
  const admin = createAdminClient();
  const sessionClient = await createClient();
  if (!admin || !sessionClient) redirect('/?auth=local-test-unavailable');

  const { data: existingUser, error: lookupError } = await admin.auth.admin.getUserById('f1e6f676-238a-4f92-9391-ef34fb236c20');
  if (lookupError || existingUser.user?.email !== 'pawpass-seed@pawpass.invalid') redirect('/?auth=local-test-unavailable');

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'pawpass-seed@pawpass.invalid',
    options: { redirectTo: `${getSiteUrl()}/auth/callback?next=/mascotas` },
  });
  if (error || !data.properties.hashed_token) redirect('/?auth=local-test-unavailable');

  const { error: verificationError } = await sessionClient.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: 'magiclink',
  });
  if (verificationError) redirect('/?auth=local-test-unavailable');
  redirect('/mascotas');
}
