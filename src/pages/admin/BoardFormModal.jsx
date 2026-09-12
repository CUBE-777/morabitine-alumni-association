import { useState } from 'react';
import Modal from '../../components/admin/Modal';
import { uploadImage } from '../../services/supabase/storage.service';
import { saveBoardMember } from '../../services/supabase/adminBoard.service';

export default function BoardFormModal({ member, onClose, onSaved }) {
  const isEdit = !!member;
  const [values, setValues] = useState({
    full_name: member?.full_name || '',
    position: member?.position || '',
    university: member?.university || '',
    bio: member?.bio || '',
    is_active: member?.is_active !== false,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const full_name = values.full_name.trim();
    const position = values.position.trim();
    if (!full_name || !position) {
      window.notify?.error('الاسم والصفة مطلوبان');
      return;
    }
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      const payload = {
        full_name,
        position,
        university: values.university.trim() || null,
        bio: values.bio.trim() || null,
        is_active: values.is_active,
      };
      if (photoFile) payload.photo_url = await uploadImage(photoFile, 'board');
      await saveBoardMember(member, payload);
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
      <h3>{isEdit ? 'تعديل' : 'إضافة'} عضو مكتب</h3>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label htmlFor="f_name">الاسم الكامل *</label>
          <input id="f_name" name="full_name" className="admin-input" required value={values.full_name} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_photo">الصورة الشخصية</label>
          <input id="f_photo" type="file" accept="image/*" className="admin-input" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
          {member?.photo_url && (
            <div style={{ fontSize: '.8rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
              صورة حالية موجودة، اختر ملفًا جديدًا فقط لاستبدالها.
            </div>
          )}
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_position">الصفة *</label>
          <input id="f_position" name="position" className="admin-input" required placeholder="مثال: الرئيس، الكاتب العام..." value={values.position} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_uni">الجامعة/الإطار</label>
          <input id="f_uni" name="university" className="admin-input" value={values.university} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_bio">نبذة</label>
          <textarea id="f_bio" name="bio" className="admin-textarea" rows={3} value={values.bio} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label>
            <input type="checkbox" name="is_active" checked={values.is_active} onChange={handleChange} /> نشط ويظهر في الموقع
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
