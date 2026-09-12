import { useState } from 'react';
import Modal from '../../components/admin/Modal';
import { saveAnnouncement } from '../../services/supabase/adminAnnouncements.service';

export default function AnnouncementFormModal({ announcement, onClose, onSaved }) {
  const [values, setValues] = useState({
    text: announcement?.text || '',
    link: announcement?.link || '',
    start_at: announcement?.start_at ? announcement.start_at.substring(0, 10) : '',
    end_at: announcement?.end_at ? announcement.end_at.substring(0, 10) : '',
    is_active: announcement?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = values.text.trim();
    if (!text) {
      window.notify?.error('نص الإعلان مطلوب');
      return;
    }
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      const payload = {
        text,
        link: values.link.trim() || null,
        start_at: values.start_at || null,
        // ملاحظة مهمة محفوظة من الأصل: يُحفظ تاريخ النهاية في نهاية اليوم
        // المختار (23:59:59) وليس منتصف ليله، وإلا فإن سياسة RLS "end_at >=
        // now()" تُخفي الإعلان منذ بداية آخر يوم فعليًا بدل نهايته.
        end_at: values.end_at ? `${values.end_at}T23:59:59` : null,
        is_active: values.is_active,
      };
      await saveAnnouncement(announcement, payload);
      t?.remove();
      window.notify?.success('تم الحفظ بنجاح');
      onSaved();
    } catch (err) {
      t?.remove();
      window.notify?.fromError(err, 'تعذر الحفظ');
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3>{announcement ? 'تعديل' : 'إضافة'} إعلان</h3>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label htmlFor="f_text">نص الإعلان *</label>
          <textarea id="f_text" name="text" className="admin-textarea" required rows={3} value={values.text} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_link">رابط (اختياري)</label>
          <input id="f_link" name="link" className="admin-input" value={values.link} onChange={handleChange} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="admin-form-group">
            <label htmlFor="f_start">تاريخ البداية</label>
            <input id="f_start" name="start_at" type="date" className="admin-input" value={values.start_at} onChange={handleChange} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="f_end">تاريخ النهاية</label>
            <input id="f_end" name="end_at" type="date" className="admin-input" value={values.end_at} onChange={handleChange} />
          </div>
        </div>
        <div className="admin-form-group">
          <label>
            <input type="checkbox" name="is_active" checked={values.is_active} onChange={handleChange} /> نشط
          </label>
        </div>
        <div className="admin-modal-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>حفظ</button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </Modal>
  );
}
