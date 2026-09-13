import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, applyDocumentDirection } from '../../i18n';

/**
 * تصميم جديد بطلب المستخدم: يظهر فقط اسم اللغة الحالية + سهم صغير، وعند
 * الضغط عليه تنسدل قائمة بباقي اللغتين لاختيار إحداهما. لا يزال fr/en
 * محتوى placeholder بانتظار الترجمة الفعلية (انظر i18n/index.js).
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];
  const others = SUPPORTED_LANGUAGES.filter((l) => l.code !== current.code);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    applyDocumentDirection(code);
    setOpen(false);
  };

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-switcher-current"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {current.code.toUpperCase()}
        <span className={`lang-switcher-arrow${open ? ' open' : ''}`}>▾</span>
      </button>
      {open && (
        <ul className="lang-switcher-menu" role="listbox">
          {others.map((lang) => (
            <li key={lang.code}>
              <button type="button" onClick={() => handleChange(lang.code)}>
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
