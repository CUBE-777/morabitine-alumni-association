import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PublicLayout from '../../layouts/PublicLayout';
import MembershipForm from '../../features/membership/MembershipForm';
import ContactForm from '../../features/contact/ContactForm';
import { usePublicHomeData } from '../../hooks/usePublicHomeData';
import { safeUrl } from '../../utils/sanitize';

const FALLBACK_ICONS = ['🤝', '📚', '🎒', '🌱', '🎓', '🌟', '🏆', '🤲'];

export default function Home() {
  const { t } = useTranslation();
  const { activities, gallery, settings, content, announcement } = usePublicHomeData();

  // ===== تحديث عنوان التبويب واتجاه التمرير (behavior parity فقط، لا منطق جديد) =====
  useEffect(() => {
    document.title = 'جمعية خريجي ثانوية المرابطين ببيوكرة — الموقع الرسمي';
  }, []);

  const heroTitle = content['homepage.hero_title'];
  const aboutTitle = content['homepage.about_title'];
  const brandName = settings.association_name;
  const footerCopyright = content['footer.copyright'];

  const email = settings.email || t('contact.defaultEmail');
  const phoneDigits = settings.phone ? settings.phone.replace(/[^\d+]/g, '') : '+212679672284';
  const phoneDisplay = settings.phone || t('contact.defaultPhone');
  const address = settings.address || t('contact.defaultAddress');
  const whatsappNum = settings.whatsapp ? settings.whatsapp.replace(/[^\d]/g, '') : '212679672284';
  const facebookUrl = settings.facebook ? safeUrl(settings.facebook) : '#';
  const instagramUrl = settings.instagram ? safeUrl(settings.instagram) : '#';
  const youtubeUrl = settings.youtube ? safeUrl(settings.youtube) : '';

  const activityCards = activities
    ? activities.map((a, i) => ({
        icon: FALLBACK_ICONS[i % FALLBACK_ICONS.length],
        title: a.title,
        // نفس المعالجة الأصلية: إزالة وسوم HTML من الوصف قبل الاقتطاع لعرض معاينة نصية آمنة
        desc: (a.description || '').replace(/<[^>]*>/g, '').slice(0, 140),
        href: `/activity/${encodeURIComponent(a.slug)}`,
      }))
    : t('activities.fallback', { returnObjects: true }).map((a) => ({ ...a, href: `/activity/${a.slug}` }));

  return (
    <PublicLayout brandName={brandName} copyright={footerCopyright} announcement={announcement}>
      <section className="hero" id="home">
        <svg className="hero-arc" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M 80 400 A 420 420 0 0 1 920 400" />
          <path className="inner" d="M 180 400 A 320 320 0 0 1 820 400" />
        </svg>
        <div className="container">
          <span className="hero-badge">{t('hero.badge')}</span>
          <h1 id="heroTitle">
            {heroTitle || (
              <>
                {t('hero.titlePrefix')}
                <em>{t('hero.titleEmphasis')}</em>
                {t('hero.titleSuffix')}
              </>
            )}
          </h1>
          <p>{t('hero.description')}</p>
          <div className="hero-actions">
            <a href="#join" className="btn btn-gold">{t('hero.ctaJoin')}</a>
            <a href="#activities" className="btn btn-ghost">{t('hero.ctaActivities')}</a>
          </div>
        </div>
      </section>

      <svg className="arc-divider" viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 L1440,0 L1440,40 C1140,80 300,80 0,40 Z" fill="#f7f3ea"></path>
      </svg>

      <section id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-copy">
              <div className="eyebrow">{t('about.eyebrow')}</div>
              <h2
                id="aboutTitle"
                style={{ fontSize: 'clamp(1.7rem,3.4vw,2.4rem)', color: 'var(--navy-deep)', marginBottom: 20 }}
              >
                {aboutTitle || t('about.title')}
              </h2>
              <p><Trans i18nKey="about.p1" components={{ strong: <strong /> }} /></p>
              <p><Trans i18nKey="about.p2" components={{ strong: <strong /> }} /></p>
            </div>
            <div className="pillars">
              {t('about.pillars', { returnObjects: true }).map((pillar) => (
                <div className="pillar" key={pillar.title}>
                  <span className="pillar-num">{pillar.num}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="activities on-navy" id="activities">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>{t('activities.eyebrow')}</div>
            <h2>{t('activities.title')}</h2>
            <p>{t('activities.description')}</p>
          </div>
          <div className="activity-grid" id="activityGrid">
            {activityCards.map((card) => (
              <div className="activity-card" key={card.href}>
                <div className="activity-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <a href={card.href} className="btn btn-ghost">{t('activities.viewDetails')}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="members-section" id="members">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>{t('members.eyebrow')}</div>
            <h2 style={{ color: 'var(--navy-deep)' }}>{t('members.title')}</h2>
            <p>{t('members.description')}</p>
          </div>
          <div className="people-links">
            <a href="/board" className="people-link featured">
              <div className="eyebrow">{t('members.boardEyebrow')}</div>
              <h3>{t('members.boardTitle')}</h3>
              <p>{t('members.boardDesc')}</p>
              <span className="people-link-cta">{t('members.boardCta')}</span>
            </a>
            <a href="/members" className="people-link">
              <div className="eyebrow">{t('members.membersEyebrow')}</div>
              <h3>{t('members.membersTitle')}</h3>
              <p>{t('members.membersDesc')}</p>
              <span className="people-link-cta">{t('members.membersCta')}</span>
            </a>
          </div>
        </div>
      </section>

      <section className="gallery" id="gallery">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>{t('gallery.eyebrow')}</div>
            <h2 style={{ color: 'var(--navy-deep)' }}>{t('gallery.title')}</h2>
            <p>{t('gallery.description')}</p>
          </div>
          <div className="gallery-grid" id="galleryGrid">
            {gallery.length === 0 ? (
              <div className="gallery-empty">{t('gallery.empty')}</div>
            ) : (
              gallery.map((item, i) => (
                <figure className="gallery-item" key={`${item.image_url}-${i}`}>
                  <img
                    src={safeUrl(item.image_url)}
                    alt={item.title || item.description || 'صورة من أنشطة الجمعية'}
                    loading="lazy"
                  />
                  {item.title && <figcaption>{item.title}</figcaption>}
                </figure>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="join" id="join">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>{t('join.eyebrow')}</div>
            <h2 style={{ color: 'var(--navy-deep)' }}>{t('join.title')}</h2>
            <p>{t('join.description')}</p>
          </div>
          <div className="join-grid">
            <div className="join-card featured">
              <div className="eyebrow">{t('join.membershipEyebrow')}</div>
              <h3>{t('join.membershipTitle')}</h3>
              <p>{t('join.membershipDesc')}</p>
              <ul className="join-list">
                {t('join.membershipList', { returnObjects: true }).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <MembershipForm />
            </div>
            <div className="join-card">
              <div className="eyebrow">{t('join.donateEyebrow')}</div>
              <h3>{t('join.donateTitle')}</h3>
              <p>{t('join.donateDesc')}</p>
              <ul className="join-list">
                {t('join.donateList', { returnObjects: true }).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(t('join.donateWhatsappText'))}`}
                target="_blank"
                rel="noopener"
                className="btn btn-ghost"
                style={{ color: 'var(--navy-deep)', borderColor: 'var(--navy-deep)' }}
              >
                {t('join.donateCta')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="eyebrow">{t('contact.eyebrow')}</div>
              <h2 style={{ marginBottom: 24 }}>{t('contact.title')}</h2>
              <ul className="contact-info">
                <li>
                  <span className="ico">✉</span>
                  <div>
                    <h4>{t('contact.emailLabel')}</h4>
                    <span><a href={`mailto:${email}`} style={{ color: '#aab6d6' }}>{email}</a></span>
                  </div>
                </li>
                <li>
                  <span className="ico">☎</span>
                  <div>
                    <h4>{t('contact.phoneLabel')}</h4>
                    <span><a href={`tel:${phoneDigits}`} style={{ color: '#aab6d6' }}>{phoneDisplay}</a></span>
                  </div>
                </li>
                <li>
                  <span className="ico">📍</span>
                  <div>
                    <h4>{t('contact.addressLabel')}</h4>
                    <span>{address}</span>
                  </div>
                </li>
              </ul>
              <div className="social-row">
                <a href={facebookUrl || '#'} aria-label="فيسبوك">f</a>
                <a href={instagramUrl || '#'} aria-label="إنستغرام">📷</a>
                {youtubeUrl && <a href={youtubeUrl} target="_blank" rel="noopener" aria-label="يوتيوب">▶</a>}
                <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener" aria-label="واتساب">📱</a>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
