import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StateBox from '../../components/admin/StateBox';
import { CONTENT_FIELDS, fetchSiteContentAdmin, saveSiteContent } from '../../services/supabase/adminContent.service';

// أسماء الأقسام للتبويبات (المفتاح = section في site_content)
const SECTION_LABELS = { homepage: 'الصفحة الرئيسية', footer: 'الفوتر' };

export default function Content() {
  const [values, setValues] = useState(null); // null = يحمَّل
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const sections = useMemo(() => [...new Set(CONTENT_FIELDS.map((f) => f.section))], []);
  const [active, setActive] = useState(sections[0]);

  const load = useCallback(() => {
    setValues(null);
    setError(false);
    fetchSiteContentAdmin()
      .then((data) => {
        const v = {};
        CONTENT_FIELDS.forEach((f) => {
          const row = data.find((d) => d.section === f.section && d.key === f.key);
          v[`${f.section}.${f.key}`] = row?.value || '';
        });
        setValues(v);
      })
      .catch((err) => {
        console.error('تعذر تحميل المحتوى:', err);
        window.notify?.fromError(err, 'تعذر تحميل المحتوى');
        setError(true);
      });
  }, []);

  useEffect(() => {
    document.title = 'محتوى الموقع — لوحة إدارة الجمعية';
    load();
  }, [load]);

  const handleChange = (field, value) => setValues((v) => ({ ...v, [`${field.section}.${field.key}`]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      const rows = CONTENT_FIELDS.map((f) => ({ section: f.section, key: f.key, value: values[`${f.section}.${f.key}`] }));
      await saveSiteContent(rows);
      t?.remove();
      window.notify?.success('تم حفظ التغييرات بنجاح');
    } catch (err) {
      t?.remove();
      window.notify?.fromError(err, 'تعذر حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader title="محتوى الموقع" subtitle="عدّل النصوص الظاهرة في الصفحة الرئيسية والفوتر دون لمس الكود" />
      <div className="admin-panel">
        <StateBox state={error ? 'error' : values === null ? 'loading' : ''} errorText="تعذر تحميل المحتوى." onRetry={load} />
        {values !== null && (
          <form onSubmit={handleSubmit}>
            <div className="admin-tabs" role="tablist" aria-label="أقسام المحتوى">
              {sections.map((s) => (
                <button key={s} type="button" role="tab" id={`tab_${s}`} aria-selected={active === s} aria-controls={`panel_${s}`}
                  className={`admin-tab-btn${active === s ? ' active' : ''}`} onClick={() => setActive(s)}>
                  {SECTION_LABELS[s] || s}
                </button>
              ))}
            </div>
            {sections.map((s) => (
              <div key={s} id={`panel_${s}`} role="tabpanel" aria-labelledby={`tab_${s}`} hidden={active !== s}>
                {CONTENT_FIELDS.filter((f) => f.section === s).map((f) => (
                  <div className="admin-form-group" key={`${f.section}.${f.key}`}>
                    <label htmlFor={`fld_${f.section}_${f.key}`}>{f.label}</label>
                    <textarea
                      id={`fld_${f.section}_${f.key}`}
                      className="admin-textarea"
                      rows={2}
                      value={values[`${f.section}.${f.key}`]}
                      onChange={(e) => handleChange(f, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving && <span className="admin-btn-spinner" aria-hidden="true" />}
              {saving ? 'جاري الحفظ...' : 'حفظ كل التعديلات'}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
