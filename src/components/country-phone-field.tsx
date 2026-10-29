'use client';

import { useState } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import countryOptions from './country-options.json';

type Props = {
  label: string;
  inputName: string;
  countryName: string;
  defaultCountry?: string;
  defaultValue?: string;
  required?: boolean;
};

export function CountryPhoneField({ label, inputName, countryName, defaultCountry = 'MX', defaultValue = '', required = true }: Props) {
  const [digits, setDigits] = useState(defaultValue.replace(/\D/g, '').slice(0, 15));
  const [focused, setFocused] = useState(false);
  const formatted = digits.length > 2 ? `${digits.slice(0, 2)} ${digits.slice(2).match(/.{1,4}/g)?.join(' ')}` : digits;
  return (
    <fieldset className="field phone-field">
      <legend>{label}</legend>
      <div className="phone-field__row">
        <label className="sr-only" htmlFor={`${countryName}-country`}>País o lada de {label.toLowerCase()}</label>
        <select id={`${countryName}-country`} name={countryName} defaultValue={defaultCountry as CountryCode} aria-label={`País o lada de ${label.toLowerCase()}`}>
          {countryOptions.map((item) => <option key={item.code} value={item.code}>{item.name} (+{item.callingCode})</option>)}
        </select>
        <label className="sr-only" htmlFor={`${inputName}-number`}>{label}</label>
        <input id={`${inputName}-number`} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="55 1234 5678" value={focused ? digits : formatted} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={(event) => setDigits(event.target.value.replace(/\D/g, '').slice(0, 15))} required={required} maxLength={focused ? 15 : 19} />
        <input type="hidden" name={inputName} value={digits} />
      </div>
      <small>Elige el país y escribe solo el número nacional. Lo mostraremos como 55 1234 5678.</small>
    </fieldset>
  );
}
