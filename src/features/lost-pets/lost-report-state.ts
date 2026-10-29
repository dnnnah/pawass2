export type LostReportRow = {
  id: string;
  pet_id: string;
  status: 'active' | 'recovered';
  lost_at: string;
  recovered_at: string | null;
  last_seen_location: string | null;
  last_seen_at: string | null;
  wearing: string | null;
  message: string | null;
  reward: string | null;
  recent_photo_path: string | null;
};

export type PublicLostPet = {
  public_code: string;
  pet_name: string;
  species: 'perro' | 'gato';
  photo_path: string | null;
  photo_url?: string | null;
  whatsapp_phone: string;
  lost_at: string;
  last_seen_location: string | null;
  last_seen_at: string | null;
  wearing: string | null;
  message: string | null;
  reward: string | null;
};
