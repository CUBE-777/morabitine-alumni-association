import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, applyDocumentDirection } from '../../i18n';

/**
 * زر تبديل اللغة. مرئي وفعّال لكل اللغات الثلاث، لكن fr/en يعرضان حاليًا
 * نفس النص العربي (raw placeholder) لأن الترجمة الفعلية لم تُطلب بعد — انظر
 * ملاحظة i18n/index.js. لا يُخفى الزر لتبقى البنية جاهزة عند توفر الترجمة.
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    applyDocumentDirection(code);
  };

  return (
    <div className="lang-switcher" role="group" aria-label="تبديل اللغة">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`lang-switcher-btn${i18n.language === lang.code ? ' active' : ''}`}
          onClick={() => handleChange(lang.code)}
          title={lang.translated ? undefined : 'الترجمة الكاملة لهذه اللغة قيد الإعداد'}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
