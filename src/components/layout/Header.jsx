import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ brandName }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['#home', t('nav.home')],
    ['#about', t('nav.about')],
    ['#activities', t('nav.activities')],
    ['#members', t('nav.members')],
    ['#gallery', t('nav.gallery')],
    ['#join', t('nav.join')],
    ['#contact', t('nav.contact')],
  ];

  return (
    <header id="site-header" className={scrolled ? 'scrolled' : ''}>
      <div className="container">
        <a href="#home" className="brand">
          <img src="/logo.jpg" alt="شعار جمعية خريجي ثانوية المرابطين" />
          <div className="brand-text">
            {brandName || t('brand.name')}
            <span>{t('brand.tagline')}</span>
          </div>
        </a>
        <button
          className="nav-toggle"
          aria-label="فتح القائمة"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav id="mainNav" className={navOpen ? 'open' : ''}>
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
