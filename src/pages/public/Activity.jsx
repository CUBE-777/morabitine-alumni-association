import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    if (item) document.title = `${item.title} — جمعية خريجي ثانوية المرابطين`;
  }, [item]);

  const sanitizedContent = useMemo(() => (item?.content ? sanitizeRichText(item.content) : ''), [item]);
  const imageSrc = item?.image ? safeUrl(item.image) || '/logo.jpg' : '/logo.jpg';

  const shareActivity = () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      window.notify?.success('تم نسخ رابط الصفحة بنجاح!') ?? alert('تم نسخ رابط الصفحة بنجاح!');
    }
  };

  const loading = !item;

  return (
    <>
      <InteriorHeader />

      <section className="activity-hero">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">الرئيسية</Link>
            <span>‹</span>
            <a href="/#activities">أنشطتنا</a>
            <span>‹</span>
            <span style={{ color: 'var(--gold)' }}>{loading ? 'تفاصيل النشاط' : item.title}</span>
          </div>

          <h1>{loading ? 'جاري تحميل تفاصيل النشاط...' : item.title}</h1>

          <div className="activity-meta-pills">
            <div className="meta-pill">📅 <span>{item?.date || 'تاريخ النشاط'}</span></div>
            <div className="meta-pill">📍 <span>{item?.location || 'الموقع'}</span></div>
            <div className="meta-pill">🏷️ <span>{item?.category || 'الفئة'}</span></div>
          </div>
        </div>
      </section>

      <section className="activity-detail-section">
        <div className="container">
          <div className="activity-grid">
            <div className="main-card">
              <div className="featured-image-container">
                <img src={imageSrc} alt="صورة النشاط" />
              </div>

              <div className="activity-body">
                {loading ? (
                  <>
                    <h3>عن هذا النشاط</h3>
                    <p>يتم تحميل تفاصيل وهدف النشاط حالياً...</p>
                  </>
                ) : (
                  <>
                    {/* المحتوى منظّف عبر DOMPurify (sanitizeRichText) قبل الإدراج — نفس آلية الحماية الأصلية من XSS */}
                    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    {item.sub_activities && item.sub_activities.length > 0 && (
                      <>
                        <h3 style={{ marginTop: 32 }}>الأعمال والمشاريع المنجزة:</h3>
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
                                style={{ background: '#f7f3ea', border: '1px solid #e9e3d5', borderRadius: 12, padding: 18 }}
                              >
                                {subImage && (
                                  <img
                                    src={subImage}
                                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                                    alt={sub.title || ''}
                                  />
                                )}
                                <h4 style={{ color: '#081633', marginBottom: 8 }}>{sub.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#5b6784' }}>{sub.desc}</p>
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
              <h3>معلومات إضافية</h3>

              <ul className="info-list">
                <li>
                  <div className="info-icon">📆</div>
                  <div className="info-text">
                    <label>التاريخ والزمان</label>
                    <span>{item?.date || '--'}</span>
                  </div>
                </li>
                <li>
                  <div className="info-icon">📍</div>
                  <div className="info-text">
                    <label>مكان التنفيذ</label>
                    <span>{item?.location || '--'}</span>
                  </div>
                </li>
                <li>
                  <div className="info-icon">👥</div>
                  <div className="info-text">
                    <label>المستفيدون</label>
                    <span>{item?.target || 'تلاميذ وخريجو الثانوية'}</span>
                  </div>
                </li>
              </ul>

              <a href="/#join" className="btn btn-gold">المشاركة أو الانخراط</a>
              <button className="btn btn-outline" onClick={shareActivity}>
                مشاركة النشاط 🔗
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
