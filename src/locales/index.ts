import { en } from './en';
import { al } from './al';
import { it } from './it';

export const translations = { en, al, it } as const;
export type SupportedLang = keyof typeof translations;

export type TranslationKey = keyof typeof translations.en;

export function t(
  key: TranslationKey,
  lang: SupportedLang = 'al' 
) {
  // fallback if key doesn't exist
  if (!translations[lang][key]) return translations['al'][key] || key;
  return translations[lang][key];
}