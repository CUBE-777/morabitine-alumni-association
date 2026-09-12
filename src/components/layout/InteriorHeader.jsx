import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function InteriorHeader() {
  const { t } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);

  const links = [
    ['/#home', t('nav.home')],
    ['/#about', t('nav.about')],
    ['/#activities', t('nav.activities')],
    ['/#members', t('nav.members')],
    ['/#gallery', t('nav.gallery')],
    ['/#join', t('nav.join')],
    ['/#contact', t('nav.contact')],
  ];

  return (
    <header className="static-header">
      <div className="container">
        <Link to="/" className="brand">
          <img src="/logo.jpg" alt="شعار جمعية خريجي ثانوية المرابطين" />
          <div className="brand-text">
            {t('brand.name')}
            <span>{t('brand.tagline')}</span>
          </div>
        </Link>
        <button className="nav-toggle" aria-label="فتح القائمة" onClick={() => setNavOpen((v) => !v)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={navOpen ? 'open' : ''}>
          <ul>
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} onClick={() => setNavOpen(false)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
