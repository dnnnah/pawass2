import type { PublicLostPet } from './lost-report-state';

type PublicLostPetsClient = {
  rpc: (name: string, args: { p_species: string | null; p_query: null }) => PromiseLike<{
    data: unknown;
    error: unknown;
  }>;
};

export async function getPublicLostPets(client: PublicLostPetsClient, species: string | null) {
  const { data, error } = await client.rpc('get_public_lost_pets', {
    p_species: species,
    p_query: null,
  });

  if (error) return { ok: false as const };
  return { ok: true as const, pets: (data || []) as PublicLostPet[] };
}

type PublicLostPetClient = {
  rpc: (name: string, args: { p_code: string }) => PromiseLike<{ data: unknown; error: unknown }>;
};

export async function getPublicLostPet(client: PublicLostPetClient, code: string) {
  const { data, error } = await client.rpc('get_public_lost_pet', { p_code: code });
  if (error) return { status: 'unavailable' as const };
  const pet = (data as PublicLostPet[] | null)?.[0];
  return pet ? { status: 'found' as const, pet } : { status: 'missing' as const };
}
