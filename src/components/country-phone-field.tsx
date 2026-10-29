'use client';

import { getCountries, type CountryCode } from 'libphonenumber-js';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });
const countryOptions = getCountries().map((country) => ({
  code: country,
  name: regionNames.of(country) || country,
})).sort((a, b) => a.name.localeCompare(b.name, 'es'));

type Props = {
  label: string;
  inputName: string;
  countryName: string;
  defaultCountry?: string;
  defaultValue?: string;
  required?: boolean;
};

export function CountryPhoneField({ label, inputName, countryName, defaultCountry = 'MX', defaultValue = '', required = true }: Props) {
  return (
    <fieldset className="field phone-field">
      <legend>{label}</legend>
      <div className="phone-field__row">
        <label className="sr-only" htmlFor={`${countryName}-country`}>País o lada de {label.toLowerCase()}</label>
        <select id={`${countryName}-country`} name={countryName} defaultValue={defaultCountry as CountryCode} aria-label={`País o lada de ${label.toLowerCase()}`}>
          {countryOptions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
        <label className="sr-only" htmlFor={`${inputName}-number`}>{label}</label>
        <input id={`${inputName}-number`} name={inputName} type="tel" inputMode="tel" autoComplete={inputName === 'phone' ? 'tel' : 'tel-national'} placeholder="55 1234 5678" defaultValue={defaultValue} required={required} maxLength={30} />
      </div>
      <small>Elige el país e incluye su lada al escribir el número.</small>
    </fieldset>
  );
}
