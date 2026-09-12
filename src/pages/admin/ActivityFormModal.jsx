import { useState } from 'react';
import Modal from '../../components/admin/Modal';
import { uploadImage } from '../../services/supabase/storage.service';
import { saveActivity } from '../../services/supabase/adminActivities.service';

export default function ActivityFormModal({ activity, onClose, onSaved }) {
  const isEdit = !!activity;
  const [values, setValues] = useState({
    title: activity?.title || '',
    category: activity?.category || '',
    target_audience: activity?.target_audience || '',
    date: activity?.date || '',
    time: activity?.time || '',
    location: activity?.location || '',
    description: activity?.description || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = values.title.trim();
    if (!title) {
      window.notify?.error('العنوان مطلوب');
      return;
    }
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      let coverUrl = activity?.cover_image_url || null;
      if (imageFile) coverUrl = await uploadImage(imageFile, 'activities');
      const payload = {
        title,
        category: values.category.trim() || null,
        target_audience: values.target_audience.trim() || null,
        date: values.date || null,
        time: values.time.trim() || null,
        location: values.location.trim() || null,
        description: values.description || null,
        cover_image_url: coverUrl,
      };
      await saveActivity(activity, payload);
      t?.remove();
      window.notify?.success('تم حفظ النشاط بنجاح');
      onSaved();
    } catch (err) {
      t?.remove();
      window.notify?.fromError(err, 'تعذر حفظ النشاط، حاول مرة أخرى.');
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3>{isEdit ? 'تعديل نشاط' : 'إضافة نشاط جديد'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label htmlFor="f_title">العنوان *</label>
          <input id="f_title" name="title" className="admin-input" required value={values.title} onChange={handleChange} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="admin-form-group">
            <label htmlFor="f_category">الفئة</label>
            <input id="f_category" name="category" className="admin-input" value={values.category} onChange={handleChange} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="f_target">الفئة المستهدفة</label>
            <input id="f_target" name="target_audience" className="admin-input" value={values.target_audience} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="admin-form-group">
            <label htmlFor="f_date">التاريخ</label>
            <input id="f_date" name="date" type="date" className="admin-input" value={values.date} onChange={handleChange} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="f_time">الوقت</label>
            <input id="f_time" name="time" className="admin-input" value={values.time} onChange={handleChange} />
          </div>
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_location">المكان</label>
          <input id="f_location" name="location" className="admin-input" value={values.location} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_image">صورة الغلاف</label>
          <input id="f_image" type="file" accept="image/*" className="admin-input" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          {activity?.cover_image_url && (
            <div style={{ fontSize: '.8rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
              صورة حالية موجودة، اختر ملفًا جديدًا فقط لاستبدالها.
            </div>
          )}
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_description">الوصف</label>
          <textarea id="f_description" name="description" className="admin-textarea" style={{ minHeight: 140 }} value={values.description} onChange={handleChange} />
        </div>
        <div className="admin-modal-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {isEdit ? 'حفظ التعديلات' : 'حفظ كمسودة'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </Modal>
  );
}
