import { useState } from 'react';
import Modal from '../../components/admin/Modal';
import { uploadImage } from '../../services/supabase/storage.service';
import { createMember, updateMember } from '../../services/supabase/adminMembers.service';
import PublicProfileFields, {
  MEMBER_TR_FIELDS,
  initProfileState,
  buildProfile,
  applyProfileToPayload,
} from '../../components/admin/PublicProfileFields';

const emptyForm = {
  full_name: '', university: '', promotion: '', track: '', profession: '', city: '', email: '', phone: '', status: 'active', bio: '',
};

export default function MemberFormModal({ member, onClose, onSaved }) {
  const isEdit = !!member;
  const [values, setValues] = useState(
    member
      ? {
          full_name: member.full_name || '',
          university: member.university || '',
          promotion: member.promotion || '',
          track: member.track || '',
          profession: member.profession || '',
          city: member.city || '',
          email: member.email || '',
          phone: member.phone || '',
          status: member.status === 'inactive' ? 'inactive' : 'active',
          bio: member.bio || '',
        }
      : emptyForm
  );
  const [profile, setProfile] = useState(() => initProfileState(member, MEMBER_TR_FIELDS));
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.full_name.trim()) {
      window.notify?.error('الاسم الكامل مطلوب');
      return;
    }
    // الملف العام + الترجمات: التحقق من الروابط وبناء الحمولة (انظر PublicProfileFields)
    const built = buildProfile(profile, member, MEMBER_TR_FIELDS);
    if (built.error) {
      window.notify?.error(built.error);
      return;
    }

    setSaving(true);
    const payload = {
      full_name: values.full_name.trim(),
      university: values.university.trim() || null,
      promotion: values.promotion.trim() || null,
      track: values.track.trim() || null,
      profession: values.profession.trim() || null,
      city: values.city.trim() || null,
      email: values.email.trim() || null,
      phone: values.phone.trim() || null,
      status: values.status,
      bio: values.bio.trim() || null,
    };

    // حقول الملف العام (0010) والترجمات (0011): تُرسل فقط إن كانت الأعمدة موجودة أصلًا (عند التعديل)
    // أو إن كتب المسؤول فيها شيئًا، فلا يتأثر الحفظ العادي إن لم تُشغَّل ملفات SQL بعد.
    applyProfileToPayload(payload, built, member, isEdit);
    const loadingToast = window.notify?.loading(isEdit ? 'جاري حفظ التعديلات...' : 'جاري إضافة العضو...');
    try {
      if (photoFile) {
        payload.photo_url = await uploadImage(photoFile, 'members');
      }
      let result;
      if (isEdit) {
        result = await updateMember(member.id, payload);
        loadingToast?.remove();
        window.notify?.success('تم حفظ التعديلات بنجاح');
      } else {
        result = await createMember(payload);
        loadingToast?.remove();
        window.notify?.success('تمت إضافة العضو بنجاح');
      }
      if (result?.degraded) {
        window.notify?.info('حُفظت البيانات الأساسية، أما الملف العام (النبذة/المسار/الروابط) والترجمات فيحتاجان تشغيل ملفات SQL الخاصة بهما (0010 و0011) في Supabase أولًا.');
      }
      onSaved();
    } catch (err) {
      loadingToast?.remove();
      window.notify?.fromError(err, 'تعذر حفظ البيانات، حاول مرة أخرى.');
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3>{isEdit ? 'تعديل عضو' : 'إضافة عضو جديد'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label htmlFor="f_full_name">الاسم الكامل *</label>
          <input id="f_full_name" name="full_name" className="admin-input" required value={values.full_name} onChange={handleChange} />
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
          <label htmlFor="f_university">الجامعة / المعهد (اختصار)</label>
          <input id="f_university" name="university" className="admin-input" maxLength={60} placeholder="مثال: FSA، ENSA، ISTA" value={values.university} onChange={handleChange} />
          <div style={{ fontSize: '.8rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
            يظهر تحت صورة العضو في الموقع كما تكتبه تمامًا، فاكتب الاختصار.
          </div>
        </div>
        <div className="admin-form-grid-2">
          <div className="admin-form-group">
            <label htmlFor="f_promotion">الدفعة</label>
            <input id="f_promotion" name="promotion" className="admin-input" value={values.promotion} onChange={handleChange} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="f_track">الشعبة</label>
            <input id="f_track" name="track" className="admin-input" value={values.track} onChange={handleChange} />
          </div>
        </div>
        <div className="admin-form-grid-2">
          <div className="admin-form-group">
            <label htmlFor="f_profession">المهنة</label>
            <input id="f_profession" name="profession" className="admin-input" value={values.profession} onChange={handleChange} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="f_city">المدينة</label>
            <input id="f_city" name="city" className="admin-input" value={values.city} onChange={handleChange} />
          </div>
        </div>
        <div className="admin-form-grid-2">
          <div className="admin-form-group">
            <label htmlFor="f_email">البريد الإلكتروني</label>
            <input id="f_email" name="email" type="email" className="admin-input" value={values.email} onChange={handleChange} />
          </div>
          <div className="admin-form-group">
            <label htmlFor="f_phone">الهاتف</label>
            <input id="f_phone" name="phone" className="admin-input" value={values.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_status">الحالة</label>
          <select id="f_status" name="status" className="admin-select" value={values.status} onChange={handleChange}>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
        <div className="admin-form-group">
          <label htmlFor="f_bio">ملاحظات داخلية (لا تظهر للزوار)</label>
          <textarea id="f_bio" name="bio" className="admin-textarea" rows={2} value={values.bio} onChange={handleChange} />
        </div>

        <PublicProfileFields
          profile={profile}
          setProfile={setProfile}
          trFields={MEMBER_TR_FIELDS}
          source={{ profession: values.profession, track: values.track }}
          bioLabel="نبذة عن العضو"
        />
        <div className="admin-modal-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {isEdit ? 'حفظ التعديلات' : 'إضافة العضو'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </Modal>
  );
}
