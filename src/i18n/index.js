/**
 * src/i18n/index.js
 * بنية تعدد اللغات (AR/FR/EN) جاهزة للاستخدام حسب طلب الجمعية، لكن حاليًا
 * ar.json فقط هو المحتوى الحقيقي (الموقع الأصلي عربي RTL فقط). en/fr هما
 * نسخة مؤقتة (placeholder) من نفس النصوص العربية حتى تُنجز الترجمة الفعلية —
 * هذا يمنع كسر الواجهة عند التبديل، لكنه لا يعرض محتوى مترجَمًا بعد.
 * راجع تقرير الترحيل لقرار النطاق. لا تُخفِ زر تبديل اللغة، لكن نبّه المستخدم
 * أن الترجمة الكاملة قادمة (انظر LanguageSwitcher).
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'ar', dir: 'rtl', label: 'العربية', translated: true },
  { code: 'fr', dir: 'ltr', label: 'Français', translated: false },
  { code: 'en', dir: 'ltr', label: 'English', translated: false },
];

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false }, // React يهرّب النصوص تلقائيًا أصلاً
});

export function applyDocumentDirection(langCode) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  document.documentElement.lang = lang.code;
  document.documentElement.dir = lang.dir;
}

export default i18n;
