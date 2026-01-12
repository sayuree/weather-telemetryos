import type { ViewConfig } from "./ViewConfig";

export const DEFAULT_CONFIG: ViewConfig = {
  selectedView: "flamingo",
};

// OpenWeatherMap supported languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "bg", name: "Bulgarian (Български)" },
  { code: "ca", name: "Catalan (Català)" },
  { code: "zh_cn", name: "Chinese Simplified (简体中文)" },
  { code: "zh_tw", name: "Chinese Traditional (繁體中文)" },
  { code: "hr", name: "Croatian (Hrvatski)" },
  { code: "cz", name: "Czech (Čeština)" },
  { code: "da", name: "Danish (Dansk)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "fi", name: "Finnish (Suomi)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "el", name: "Greek (Ελληνικά)" },
  { code: "he", name: "Hebrew (עברית)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "hu", name: "Hungarian (Magyar)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "kk", name: "Kazakh (Қазақ)" },
  { code: "kr", name: "Korean (한국어)" },
  { code: "la", name: "Latvian (Latviešu)" },
  { code: "lt", name: "Lithuanian (Lietuvių)" },
  { code: "mk", name: "Macedonian (Македонски)" },
  { code: "no", name: "Norwegian (Norsk)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "pt_br", name: "Portuguese Brasil" },
  { code: "ro", name: "Romanian (Română)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "sk", name: "Slovak (Slovenčina)" },
  { code: "sl", name: "Slovenian (Slovenščina)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "sv", name: "Swedish (Svenska)" },
  { code: "th", name: "Thai (ไทย)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "uk", name: "Ukrainian (Українська)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
];

export const THEME_OPTIONS = [
  { value: "flamingo", label: "Flamingo" },
  { value: "sky", label: "Sky" },
  { value: "urban", label: "Urban" },
  { value: "watermelon", label: "Watermelon" },
  { value: "neapolitan", label: "Neapolitan" },
  { value: "meadow", label: "Meadow" },
  { value: "forest", label: "Forest" },
];
