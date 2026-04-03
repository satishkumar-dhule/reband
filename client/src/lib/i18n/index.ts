/**
 * i18n (Internationalization) utilities for DevPrep
 * 
 * Simple translation system using English as the default locale.
 * To add more languages, create additional locale files and
 * update the locale configuration.
 */

import { en } from './en';

/**
 * Current locale - currently only English is supported
 * Future: expand to support multiple languages
 */
const currentLocale = 'en';

/**
 * Translation dictionary - maps locale to translations
 */
const translations: Record<string, Record<string, string>> = {
  en,
};

/**
 * Get translation for a key
 * 
 * @param key - Translation key (e.g., 'home.dashboard')
 * @param params - Optional params for interpolation (e.g., { count: 5 })
 * @returns Translated string
 * 
 * @example
 * t('home.dashboard') // 'Dashboard'
 * t('onboarding.selectChannels.recommended', { role: 'Frontend' }) // 'Recommended based on your Frontend choice'
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const localeTranslations = translations[currentLocale];
  let text = localeTranslations[key] || key;
  
  // Handle interpolation if params provided
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }
  
  return text;
}

/**
 * Get all translations for the current locale
 */
export function getTranslations(): Record<string, string> {
  return translations[currentLocale] || {};
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string): boolean {
  return key in translations[currentLocale];
}

/**
 * Get current locale code
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * Available locales for future expansion
 */
export const availableLocales = ['en'] as const;

export type Locale = typeof availableLocales[number];