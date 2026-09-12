import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { CONTENT_FIELDS, fetchSiteContentAdmin, saveSiteContent } from '../../services/supabase/adminContent.service';

export default function Content() {
  const [values, setValues] = useState(null); // null = يحمَّل
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'محتوى الموقع — لوحة إدارة الجمعية';
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
      });
  }, []);

  const handleChange = (field, value) => setValues((v) => ({ ...v, [`${field.section}.${field.key}`]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      const rows = CONTENT_FIELDS.map((f) => ({ section: f.section, key: f.key, value: values[`${f.section}.${f.key}`] }));
      await saveSiteContent(rows);
      t?.remove();
      window.notify?.success('تم حفظ المحتوى بنجاح');
    } catch (err) {
      t?.remove();
      window.notify?.fromError(err, 'تعذر حفظ المحتوى');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader title="محتوى الموقع" subtitle="عدّل النصوص الظاهرة في الصفحة الرئيسية والفوتر دون لمس الكود" />
      <div className="admin-panel">
        {values === null ? (
          <div className="admin-state-box">جاري التحميل...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {CONTENT_FIELDS.map((f) => (
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
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>حفظ كل التعديلات</button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
