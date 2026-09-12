import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/Modal';
import BoardFormModal from './BoardFormModal';
import { fetchBoardMembers, swapBoardOrder, deleteBoardMember } from '../../services/supabase/adminBoard.service';

export default function Board() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [formTarget, setFormTarget] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    document.title = 'أعضاء المكتب — لوحة إدارة الجمعية';
  }, []);

  const load = () => {
    setRows(null);
    setError(false);
    fetchBoardMembers()
      .then(setRows)
      .catch((err) => {
        console.error('تعذر تحميل أعضاء المكتب:', err);
        window.notify?.fromError(err, 'تعذر تحميل أعضاء المكتب');
        setError(true);
      });
  };

  useEffect(load, []);

  const move = async (item, dir) => {
    const idx = rows.indexOf(item);
    const swapWith = rows[idx + dir];
    if (!swapWith) return;
    try {
      await swapBoardOrder(item, swapWith);
      load();
    } catch (err) {
      window.notify?.fromError(err, 'تعذر تغيير الترتيب');
    }
  };

  const doDelete = async (member) => {
    setDeleteTarget(null);
    const t = window.notify?.loading('جاري الحذف...');
    try {
      await deleteBoardMember(member);
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
        title="أعضاء المكتب"
        subtitle='يظهر هذا الترتيب في صفحة "المكتب" على الموقع العام'
        actions={<button className="admin-quick-action" onClick={() => setFormTarget(null)}>+ إضافة عضو مكتب</button>}
      />

      <div className="admin-panel">
        {rows === null && !error && <div className="admin-state-box">جاري التحميل...</div>}
        {error && <div className="admin-state-box">تعذر التحميل.</div>}
        {rows && rows.length === 0 && <div className="admin-state-box">لا يوجد أعضاء مكتب بعد.</div>}
        {rows && rows.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead><tr><th>#</th><th>الاسم</th><th>الصفة</th><th>الحالة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {rows.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td>{b.full_name}</td>
                    <td>{b.position}</td>
                    <td><span className={`admin-badge admin-badge-${b.is_active ? 'approved' : 'rejected'}`}>{b.is_active ? 'نشط' : 'غير نشط'}</span></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === 0} onClick={() => move(b, -1)}>↑</button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === rows.length - 1} onClick={() => move(b, 1)}>↓</button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setFormTarget(b)}>تعديل</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteTarget(b)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formTarget !== undefined && (
        <BoardFormModal
          member={formTarget}
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
          <p>حذف <strong>{deleteTarget.full_name}</strong> من أعضاء المكتب؟</p>
          <div className="admin-modal-actions">
            <button className="admin-btn admin-btn-danger" onClick={() => doDelete(deleteTarget)}>حذف</button>
            <button className="admin-btn admin-btn-ghost" onClick={() => setDeleteTarget(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
