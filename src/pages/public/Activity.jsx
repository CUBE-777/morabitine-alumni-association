import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/public-home.css';
import '../../styles/interior-page.css';
import '../../styles/activity-page.css';
import InteriorHeader from '../../components/layout/InteriorHeader';
import InteriorFooter from '../../components/layout/InteriorFooter';
import Lightbox from '../../components/common/Lightbox';
import { fetchActivityBySlug } from '../../services/supabase/activityDetail.service';
import { defaultActivities } from '../../constants/defaultActivities';
import { sanitizeRichText, safeUrl } from '../../utils/sanitize';

export default function Activity() {
  const { t } = useTranslation();
  const { slug: rawSlug } = useParams();
  const slug = rawSlug || 'annual-meeting';
  const [item, setItem] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchActivityBySlug(slug)
      .then((data) => {
        if (!alive) return;
        setItem(data || defaultActivities[slug] || defaultActivities['annual-meeting']);
      })
      .catch((err) => {
        console.error('تعذر تحميل النشاط من قاعدة البيانات:', err);
        if (alive) setItem(defaultActivities[slug] || defaultActivities['annual-meeting']);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (item) document.title = `${item.title} — ${t('brand.name')}`;
  }, [item, t]);

  const sanitizedContent = useMemo(() => (item?.content ? sanitizeRichText(item.content) : ''), [item]);
  const imageSrc = item?.image ? safeUrl(item.image) || '/logo.jpg' : '/logo.jpg';

  const shareActivity = () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      window.notify?.success(t('activityPage.linkCopied')) ?? alert(t('activityPage.linkCopied'));
    }
  };

  const loading = !item;

  return (
    <>
      <InteriorHeader />

      <section className="activity-hero">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">{t('nav.home')}</Link>
            <span>‹</span>
            <a href="/#activities">{t('activityPage.activitiesCrumb')}</a>
            <span>‹</span>
            <span style={{ color: 'var(--gold)' }}>{loading ? t('activityPage.detailsCrumbFallback') : item.title}</span>
          </div>

          <h1>{loading ? t('activityPage.loadingTitle') : item.title}</h1>

          <div className="activity-meta-pills">
            <div className="meta-pill">📅 <span>{item?.date || t('activityPage.dateFallback')}</span></div>
            <div className="meta-pill">📍 <span>{item?.location || t('activityPage.locationFallback')}</span></div>
            <div className="meta-pill">🏷️ <span>{item?.category || t('activityPage.categoryFallback')}</span></div>
          </div>
        </div>
      </section>

      <section className="activity-detail-section">
        <div className="container">
          <div className="activity-grid">
            <div className="main-card">
              <div className="featured-image-container">
                <img src={imageSrc} alt={t('activityPage.imageAlt')} />
              </div>

              <div className="activity-body">
                {loading ? (
                  <>
                    <h3>{t('activityPage.aboutTitle')}</h3>
                    <p>{t('activityPage.loadingBody')}</p>
                  </>
                ) : (
                  <>
                    {/* المحتوى منظّف عبر DOMPurify (sanitizeRichText) قبل الإدراج — نفس آلية الحماية الأصلية من XSS */}
                    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    {item.sub_activities && item.sub_activities.length > 0 && (
                      <>
                        <h3 style={{ marginTop: 32 }}>{t('activityPage.achievementsTitle')}</h3>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 16,
                            marginTop: 16,
                          }}
                        >
                          {item.sub_activities.map((sub, i) => {
                            const subImage = safeUrl(sub.image);
                            return (
                              <div
                                key={i}
                                style={{
                                  background: 'var(--cream)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 12,
                                  padding: 18,
                                }}
                              >
                                {subImage && (
                                  <img
                                    src={subImage}
                                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                                    alt={sub.title || ''}
                                  />
                                )}
                                <h4 style={{ color: 'var(--navy-deep)', marginBottom: 8 }}>{sub.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{sub.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>{t('activityPage.extraInfoTitle')}</h3>

              <ul className="info-list">
                <li>
                  <div className="info-icon">📆</div>
                  <div className="info-text">
                    <label>{t('activityPage.dateTimeLabel')}</label>
                    <span>{item?.date || '--'}</span>
                  </div>
                </li>
                <li>
                  <div className="info-icon">📍</div>
                  <div className="info-text">
                    <label>{t('activityPage.locationLabel')}</label>
                    <span>{item?.location || '--'}</span>
                  </div>
                </li>
                <li>
                  <div className="info-icon">👥</div>
                  <div className="info-text">
                    <label>{t('activityPage.beneficiariesLabel')}</label>
                    <span>{item?.target || t('activityPage.beneficiariesFallback')}</span>
                  </div>
                </li>
              </ul>

              <a href="/#join" className="btn btn-gold">{t('activityPage.joinCta')}</a>
              <button className="btn btn-outline" onClick={shareActivity}>
                {t('activityPage.shareCta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <InteriorFooter />
      <Lightbox />
    </>
  );
}
