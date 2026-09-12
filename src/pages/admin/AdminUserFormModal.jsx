import { useState } from 'react';
import Modal from '../../components/admin/Modal';
import { createAdminProfile, updateAdminProfile } from '../../services/supabase/adminUsers.service';

export default function AdminUserFormModal({ profile, onClose, onSaved }) {
  const isEdit = !!profile;
  const [values, setValues] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    role: profile?.role || 'editor',
    is_active: profile?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const full_name = values.full_name.trim();
    const email = values.email.trim();
    if (!full_name || !email) {
      window.notify?.error('الاسم والبريد مطلوبان');
      return;
    }
    setSaving(true);
    const t = window.notify?.loading('جاري الحفظ...');
    try {
      if (isEdit) {
        await updateAdminProfile(profile, { full_name, email, role: values.role, is_active: values.is_active });
        t?.remove();
        window.notify?.success('تم الحفظ بنجاح');
      } else {
        await createAdminProfile({ email, full_name, role: values.role });
        t?.remove();
        window.notify?.success('تم إنشاء المسؤول بنجاح، وأُرسل له رابط لضبط كلمة المرور.');
      }
      onSaved();
    } catch (err) {
      t?.remove();
      window.notify?.fromError(err, isEdit ? 'تعذر الحفظ' : 'تعذر إنشاء المسؤول');
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3>{isEdit ? 'تعديل صلاحيات' : 'إنشاء مسؤول جديد'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label htmlFor="f_name">الاسم الكامل *</label>
          <input id="f_name" name="full_name" className="admin-input" required value={values.full_name} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_email">البريد الإلكتروني *</label>
          <input
            id="f_email"
            name="email"
            type="email"
            className="admin-input"
            required
            placeholder="name@example.com"
            value={values.email}
            onChange={handleChange}
          />
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_role">الدور</label>
          <select id="f_role" name="role" className="admin-select" value={values.role} onChange={handleChange}>
            <option value="editor">محرر</option>
            <option value="members_manager">مسؤول الأعضاء</option>
            <option value="super_admin">مسؤول أعلى</option>
          </select>
        </div>
        {isEdit && (
          <div className="admin-form-group">
            <label>
              <input type="checkbox" name="is_active" checked={values.is_active} onChange={handleChange} /> حساب نشط
            </label>
          </div>
        )}
        <div className="admin-modal-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>حفظ</button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </Modal>
  );
}
