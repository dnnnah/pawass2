export type Snapshot = { name: string; species: string; presentation: string | null; breed: string | null; sex: string | null; size: string | null; age_months: number | null; age_as_of: string | null };
export type SocialPet = { name: string; species: string; breed: string | null; sex: string | null; size: string | null; birth_date: string | null; approximate_age_years: number | null; approximate_age_months: number | null; approximate_age_declared_at: string | null };
export type Choices = { presentation?: string; breed?: boolean; sex?: boolean; size?: boolean; age?: boolean };
function monthsBetween(from: Date, to: Date) {
  return Math.max(0, (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + to.getUTCMonth() - from.getUTCMonth() - (to.getUTCDate() < from.getUTCDate() ? 1 : 0));
}
export function buildSnapshot(pet: SocialPet, choices: Choices, now = new Date()): Snapshot {
  const presentation = choices.presentation?.trim() || null;
  if ((presentation?.length || 0) > 300) throw new Error('La presentación admite hasta 300 caracteres.');
  let months: number | null = null;
  if (choices.age) {
    if (pet.birth_date) months = monthsBetween(new Date(pet.birth_date), now);
    else if (pet.approximate_age_years !== null || pet.approximate_age_months !== null) {
      months = (pet.approximate_age_years || 0) * 12 + (pet.approximate_age_months || 0);
      if (pet.approximate_age_declared_at) months += monthsBetween(new Date(pet.approximate_age_declared_at), now);
    }
  }
  return { name: pet.name, species: pet.species, presentation, breed: choices.breed ? pet.breed : null, sex: choices.sex ? pet.sex : null, size: choices.size ? pet.size : null, age_months: months, age_as_of: months === null ? null : now.toISOString().slice(0, 10) };
}
export function publicProfile(snapshot: Snapshot, now = new Date()) {
  const { age_months, age_as_of, ...fields } = snapshot;
  const months = age_months === null || !age_as_of ? null : age_months + monthsBetween(new Date(age_as_of), now);
  const years = months === null ? null : Math.floor(months / 12);
  return { ...fields, age: months === null ? null : years ? `${years} ${years === 1 ? 'año' : 'años'}` : `${months} ${months === 1 ? 'mes' : 'meses'}` };
}
export function isVisible(published: boolean, profileReason: string | null, postReason: string | null) {
  return published && profileReason === null && postReason === null;
}
export const socialWarning = 'Fotos y textos pueden revelar datos personales. El contenido será público y podrá copiarse fuera de PawPass, aunque pidamos a buscadores que no lo indexen.';
