import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/Modal';
import AnnouncementFormModal from './AnnouncementFormModal';
import { fetchAnnouncementsAdmin, deleteAnnouncement } from '../../services/supabase/adminAnnouncements.service';

function fmtRange(s, e) {
  const f = (d) => (d ? new Date(d).toLocaleDateString('ar-MA') : '—');
  return `${f(s)} → ${f(e)}`;
}

export default function Announcements() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [formTarget, setFormTarget] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    document.title = 'الإعلانات — لوحة إدارة الجمعية';
  }, []);

  const load = () => {
    setRows(null);
    setError(false);
    fetchAnnouncementsAdmin()
      .then(setRows)
      .catch((err) => {
        console.error('تعذر تحميل الإعلانات:', err);
        window.notify?.fromError(err, 'تعذر تحميل الإعلانات');
        setError(true);
      });
  };

  useEffect(load, []);

  const doDelete = async (a) => {
    setDeleteTarget(null);
    const t = window.notify?.loading('جاري الحذف...');
    try {
      await deleteAnnouncement(a);
      t?.remove();
      window.notify?.success('تم الحذف');
      load();
    } catch (err) {
      t?.remove();
      window.notify?.fromError(err, 'تعذر الحذف');
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="الإعلانات"
        subtitle="تظهر الإعلانات النشطة فقط في الشريط العلوي بالموقع"
        actions={<button className="admin-quick-action" onClick={() => setFormTarget(null)}>+ إعلان جديد</button>}
      />

      <div className="admin-panel">
        {rows === null && !error && <div className="admin-state-box">جاري التحميل...</div>}
        {error && <div className="admin-state-box">تعذر التحميل.</div>}
        {rows && rows.length === 0 && <div className="admin-state-box">لا توجد إعلانات بعد.</div>}
        {rows && rows.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead><tr><th>النص</th><th>الفترة</th><th>الحالة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.text}</td>
                    <td style={{ fontSize: '.8rem' }}>{fmtRange(a.start_at, a.end_at)}</td>
                    <td><span className={`admin-badge admin-badge-${a.is_active ? 'approved' : 'rejected'}`}>{a.is_active ? 'نشط' : 'موقوف'}</span></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setFormTarget(a)}>تعديل</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteTarget(a)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formTarget !== undefined && (
        <AnnouncementFormModal
          announcement={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={() => {
            setFormTarget(undefined);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <h3>تأكيد الحذف</h3>
          <p>حذف هذا الإعلان؟</p>
          <div className="admin-modal-actions">
            <button className="admin-btn admin-btn-danger" onClick={() => doDelete(deleteTarget)}>حذف</button>
            <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteTarget(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
