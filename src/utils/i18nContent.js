/**
 * src/utils/i18nContent.js
 * أدوات عرض المحتوى المتعدد اللغات القادم من قاعدة البيانات.
 * المعمارية متسقة مع بقية المشروع: الحقول الأساسية بالعربية (اللغة الأصلية)،
 * والترجمات الاختيارية في عمود jsonb باسم translations، مع fallback منطقي للعربية.
 */
const LOCALES = { ar: 'ar-MA', fr: 'fr-FR', en: 'en-GB' };

export function localeFor(lang) {
  return LOCALES[lang] || LOCALES.ar;
}

export function formatDate(value, lang, opts) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(localeFor(lang), opts || { year: 'numeric', month: 'long', day: 'numeric' });
}

/** يرجع الإعلان بحقول title/excerpt/content باللغة المطلوبة (مع fallback لكل حقل على حدة). */
export function localizeAnnouncement(row, lang) {
  if (!row) return row;
  const tr = (lang && lang !== 'ar' && row.translations && row.translations[lang]) || {};
  const pick = (key) => (tr[key] && String(tr[key]).trim()) || row[key] || '';
  return {
    ...row,
    title: pick('title') || row.text || '',
    excerpt: pick('excerpt'),
    content: pick('content'),
  };
}

/** تاريخ العرض: تاريخ النشر إن وُجد وإلا تاريخ الإنشاء. */
export function announcementDate(row) {
  return row.start_at || row.created_at;
}
