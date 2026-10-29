'use client';

import { useActionState, useEffect, useState } from 'react';
import { savePetDetails } from './actions';
import type { FormState } from '@/features/profile/actions';

const initialState: FormState = { ok: false, message: '' };
const breeds: Record<'perro' | 'gato', string[]> = {
  perro: ['Mestizo / Sin raza', 'Chihuahua', 'Labrador', 'Poodle', 'Pastor alemán', 'Schnauzer', 'Otra'],
  gato: ['Mestizo / Sin raza', 'Doméstico de pelo corto', 'Doméstico de pelo largo', 'Siamés', 'Persa', 'Otra'],
};

export type PetDetailsValues = {
  breed?: string | null;
  mixed_breed?: string | null;
  sex?: 'macho' | 'hembra' | null;
  size?: 'pequena' | 'mediana' | 'grande' | null;
  color?: string | null;
  birth_date?: string | null;
  approximate_age_years?: number | null;
  approximate_age_months?: number | null;
  approximate_age_declared_at?: string | null;
  weight_kg?: number | null;
  microchip?: string | null;
  ruac?: string | null;
  sterilized?: boolean | null;
};

export function PetDetailsForm({
  petId,
  species,
  details = {},
  onComplete,
  continueLabel = 'Guardar y continuar',
}: {
  petId: string;
  species: 'perro' | 'gato';
  details?: PetDetailsValues;
  onComplete?: () => void;
  continueLabel?: string;
}) {
  const [state, action, pending] = useActionState(savePetDetails, initialState);
  const [ageMode, setAgeMode] = useState<'date' | 'approx' | 'unknown'>(details.birth_date ? 'date' : details.approximate_age_years !== null && details.approximate_age_years !== undefined ? 'approx' : 'unknown');
  const [selectedBreed, setSelectedBreed] = useState(details.breed && !breeds[species].includes(details.breed) ? 'Otra' : details.breed || '');
  const customBreed = selectedBreed === 'Otra';

  useEffect(() => {
    if (state.ok) onComplete?.();
  }, [onComplete, state.ok]);

  return (
    <form action={action} className="form-stack pet-details-form">
      <input type="hidden" name="petId" value={petId} />
      <input type="hidden" name="approximateDeclaredAt" value={details.approximate_age_declared_at || ''} />
      <fieldset className="editor-group"><legend>Aspecto e identidad</legend><p className="form-description">Completa lo que conozcas. Puedes dejar los datos opcionales para después.</p>
      <div className="form-grid form-grid--two">
        <label className="field"><span>Raza</span>
          <select name="breed" value={selectedBreed} onChange={(event) => setSelectedBreed(event.target.value)}>
            <option value="">Elige una raza (opcional)</option>
            {breeds[species].map((breed) => <option key={breed} value={breed}>{breed}</option>)}
          </select>
        </label>
        <label className="field"><span>Mezcla estimada <em>opcional</em></span><input name="mixedBreed" defaultValue={details.mixed_breed || ''} maxLength={100} placeholder="Ej. Chihuahua con terrier" /></label>
      </div>
      {customBreed && <label className="field"><span>Escribe la raza</span><input name="customBreed" maxLength={100} required defaultValue={details.breed && !breeds[species].includes(details.breed) ? details.breed : ''} />
      </label>}
      <div className="form-grid form-grid--three">
        <label className="field"><span>Sexo <em>opcional</em></span><select name="sex" defaultValue={details.sex || ''}><option value="">Sin especificar</option><option value="hembra">Hembra</option><option value="macho">Macho</option></select></label>
        <label className="field"><span>Talla <em>opcional</em></span><select name="size" defaultValue={details.size || ''}><option value="">Sin especificar</option><option value="pequena">Pequeña</option><option value="mediana">Mediana</option><option value="grande">Grande</option></select></label>
        <label className="field"><span>Color <em>opcional</em></span><input name="color" defaultValue={details.color || ''} maxLength={100} placeholder="Ej. Negro y blanco" /></label>
      </div>
      </fieldset>
      <fieldset className="field age-field">
        <legend>Edad de {species === 'perro' ? 'tu perro' : 'tu gato'}</legend>
        <div className="age-options">
          <label><input type="radio" name="ageMode" value="unknown" checked={ageMode === 'unknown'} onChange={() => setAgeMode('unknown')} /> No la sé</label>
          <label><input type="radio" name="ageMode" value="date" checked={ageMode === 'date'} onChange={() => setAgeMode('date')} /> Fecha de nacimiento</label>
          <label><input type="radio" name="ageMode" value="approx" checked={ageMode === 'approx'} onChange={() => setAgeMode('approx')} /> Edad aproximada</label>
        </div>
        {ageMode === 'date' && <label className="field"><span>Fecha de nacimiento</span><input type="date" name="birthDate" defaultValue={details.birth_date || ''} max={new Date().toISOString().slice(0, 10)} /></label>}
        {ageMode === 'approx' && <div className="form-grid form-grid--two"><label className="field"><span>Años</span><input type="number" name="approximateYears" min="0" max="40" defaultValue={details.approximate_age_years ?? ''} /></label><label className="field"><span>Meses</span><input type="number" name="approximateMonths" min="0" max="11" defaultValue={details.approximate_age_months ?? ''} /></label></div>}
      </fieldset>
      <fieldset className="editor-group"><legend>Datos privados de cuidado</legend><p className="form-description">El microchip, la clave RUAC y estos datos de salud no aparecen en la ficha QR.</p>
      <div className="form-grid form-grid--two">
        <label className="field"><span>Peso en kg <em>opcional</em></span><input type="number" name="weightKg" min="0.1" max="300" step="0.1" defaultValue={details.weight_kg ?? ''} placeholder="Ej. 12.5" /></label>
        <label className="field"><span>Microchip <em>opcional</em></span><input name="microchip" defaultValue={details.microchip || ''} maxLength={80} autoComplete="off" /></label>
      </div>
      <div className="form-grid form-grid--two">
        <label className="field"><span>Clave RUAC <em>opcional</em></span><input name="ruac" defaultValue={details.ruac || ''} maxLength={40} autoComplete="off" /></label>
        <label className="field"><span>Esterilización <em>opcional</em></span><select name="sterilized" defaultValue={details.sterilized === true ? 'yes' : details.sterilized === false ? 'no' : ''}><option value="">Sin especificar</option><option value="yes">Sí</option><option value="no">No</option></select></label>
      </div>
      </fieldset>
      {state.message && <p className={`form-message ${state.ok ? 'form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Guardando…' : continueLabel}</button>
    </form>
  );
}
