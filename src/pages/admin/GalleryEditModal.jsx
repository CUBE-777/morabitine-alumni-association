import { useState } from 'react';
import Modal from '../../components/admin/Modal';
import { updateGalleryItem } from '../../services/supabase/adminGallery.service';

export default function GalleryEditModal({ item, activities, onClose, onSaved }) {
  const [title, setTitle] = useState(item.title || '');
  const [description, setDescription] = useState(item.description || '');
  const [activityId, setActivityId] = useState(item.activity_id || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      await updateGalleryItem(item, {
        title: title.trim() || null,
        description: description.trim() || null,
        activity_id: activityId || null,
      });
      t?.remove();
      window.notify?.success('تم الحفظ');
      onSaved();
    } catch (err) {
      t?.remove();
      window.notify?.fromError(err, 'تعذر الحفظ');
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3>تعديل الصورة</h3>
      <img src={item.image_url} style={{ width: '100%', borderRadius: 10, marginBottom: 14 }} alt={item.title || ''} />
      <div className="admin-form-group">
        <label htmlFor="f_title">العنوان</label>
        <input id="f_title" className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="admin-form-group">
        <label htmlFor="f_desc">الوصف</label>
        <textarea id="f_desc" className="admin-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="admin-form-group">
        <label htmlFor="f_activity">ربط بنشاط</label>
        <select id="f_activity" className="admin-select" value={activityId} onChange={(e) => setActivityId(e.target.value)}>
          <option value="">بدون ربط</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>
      <div className="admin-modal-actions">
        <button className="admin-btn admin-btn-primary" disabled={saving} onClick={handleSave}>حفظ</button>
        <button className="admin-btn admin-btn-ghost" onClick={onClose}>إلغاء</button>
      </div>
    </Modal>
  );
}
