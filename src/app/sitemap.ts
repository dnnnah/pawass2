import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import type { PublicLostPet } from '@/features/lost-pets/lost-report-state';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.rpc('get_public_lost_pets', { p_species: null, p_query: null });
  const pets = (data || []) as Pick<PublicLostPet, 'public_code' | 'lost_at'>[];
  return [
    { url: `${getSiteUrl()}/perdidas`, changeFrequency: 'hourly', priority: 0.8 },
    ...pets.map((pet) => ({
      url: `${getSiteUrl()}/perdidas/${encodeURIComponent(pet.public_code)}`,
      lastModified: pet.lost_at,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ];
}
