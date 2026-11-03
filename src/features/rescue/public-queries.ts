type RpcResult = { data: unknown; error: unknown };
type RescueClient = {
  rpc: (name: string, args: { p_code: string }) => PromiseLike<RpcResult>;
};
type PublicPet = {
  pet_name: string;
  species: 'perro' | 'gato';
  rescue_phone: string;
  whatsapp_phone: string;
};
type PublicCareAlert = { category: string; label: string; severity: 'critical' | 'precaution' | 'informative'; instructions: string };
type PublicRescueStatus = { lost: boolean; recovered_at: string | null };

export async function getPublicRescueData(client: RescueClient, code: string) {
  const [card, careAlerts, statuses, photos] = await Promise.all([
    client.rpc('get_public_rescue_card', { p_code: code }),
    client.rpc('get_public_care_alerts', { p_code: code }),
    client.rpc('get_public_pet_rescue_status', { p_code: code }),
    client.rpc('get_public_pet_photo', { p_code: code }),
  ]);

  if ([card, careAlerts, statuses, photos].some((result) => result.error)) {
    return { status: 'unavailable' as const };
  }

  const pet = (card.data as PublicPet[] | null)?.[0];
  if (!pet) return { status: 'missing' as const };
  if (!pet.rescue_phone || !pet.whatsapp_phone) return { status: 'unavailable' as const };

  return {
    status: 'found' as const,
    pet,
    careAlerts: (careAlerts.data || []) as PublicCareAlert[],
    rescueStatus: (statuses.data as PublicRescueStatus[] | null)?.[0],
    photoPath: ((photos.data as { photo_path?: string | null }[] | null)?.[0])?.photo_path || null,
  };
}
