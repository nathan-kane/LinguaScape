
// src/lib/tts-utils.ts
/**
 * Maps application language codes to BCP 47 language tags
 * suitable for the Web Speech API's SpeechSynthesisUtterance.lang property.
 * This is a basic mapping and might need expansion for more nuanced voice selection.
 */
export function mapToBCP47(appLangCode: string): string {
  const map: Record<string, string> = {
    en: 'en-US', // English (US)
    es: 'es-ES', // Spanish (Spain)
    fr: 'fr-FR', // French (France)
    de: 'de-DE', // German (Germany)
    it: 'it-IT', // Italian (Italy)
    pt: 'pt-PT', // Portuguese (Portugal)
    ru: 'ru-RU', // Russian (Russia)
    ua: 'uk-UA', // Ukrainian (Ukraine) - Note: 'uk' is often used for Ukrainian in BCP 47
    ja: 'ja-JP', // Japanese (Japan)
    ko: 'ko-KR', // Korean (Korea)
    zh: 'zh-CN', // Chinese (Simplified, Mainland China)
    // Add more mappings as needed
  };
  return map[appLangCode.toLowerCase()] || appLangCode; // Fallback to appLangCode if no specific mapping
}
