import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StateBox from '../../components/admin/StateBox';
import { SETTINGS_GROUPS, fetchSiteSettingsAdmin, saveSiteSettings } from '../../services/supabase/adminSettings.service';

export default function Settings() {
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setValues(null);
    setError(false);
    fetchSiteSettingsAdmin()
      .then((data) => {
        const v = {};
        SETTINGS_GROUPS.forEach((g) => g.keys.forEach(([k]) => {
          const row = data.find((d) => d.key === k);
          v[k] = row?.value || '';
        }));
        setValues(v);
      })
      .catch((err) => {
        console.error('تعذر تحميل الإعدادات:', err);
        window.notify?.fromError(err, 'تعذر تحميل الإعدادات');
        setError(true);
      });
  }, []);

  useEffect(() => {
    document.title = 'الإعدادات — لوحة إدارة الجمعية';
    load();
  }, [load]);

  const handleChange = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      const rows = [];
      SETTINGS_GROUPS.forEach((g) => g.keys.forEach(([k]) => rows.push({ key: k, value: (values[k] || '').trim() })));
      await saveSiteSettings(rows);
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
      <AdminPageHeader title="الإعدادات العامة" subtitle="معلومات الجمعية الأساسية الظاهرة في الموقع" />
      {values === null ? (
        <div className="admin-panel">
          <StateBox state={error ? 'error' : 'loading'} errorText="تعذر تحميل الإعدادات." onRetry={load} />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {SETTINGS_GROUPS.map((g) => (
            <div className="admin-panel" key={g.title}>
              <h2>{g.title}</h2>
              {g.keys.map(([k, label]) => (
                <div className="admin-form-group" key={k}>
                  <label htmlFor={`s_${k}`}>{label}</label>
                  <input id={`s_${k}`} className="admin-input" value={values[k]} onChange={(e) => handleChange(k, e.target.value)} />
                </div>
              ))}
            </div>
          ))}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving && <span className="admin-btn-spinner" aria-hidden="true" />}
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </form>
      )}
    </AdminLayout>
  );
}
