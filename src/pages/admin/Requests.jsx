import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/Modal';
import {
  fetchRequestsByStatus,
  approveMembershipRequest,
  rejectMembershipRequest,
} from '../../services/supabase/membershipRequests.service';

const TAB_LABEL = { pending: 'قيد الانتظار', approved: 'مقبولة', rejected: 'مرفوضة' };
const FIELD = (v) => (v == null || v === '' ? '—' : v);

export default function Requests() {
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'view'|'approve'|'reject', row }
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setRows(null);
    setError(false);
    fetchRequestsByStatus(tab)
      .then(setRows)
      .catch((err) => {
        console.error('تعذر تحميل الطلبات:', err);
        window.notify?.fromError(err, 'تعذر تحميل الطلبات');
        setError(true);
      });
  };

  useEffect(() => {
    document.title = 'طلبات الانخراط — لوحة إدارة الجمعية';
  }, []);

  useEffect(load, [tab]);

  const closeModal = () => {
    setModal(null);
    setRejectReason('');
  };

  const doApprove = async (row) => {
    closeModal();
    setBusy(true);
    window.notify?.loading('جاري قبول الطلب...');
    try {
      await approveMembershipRequest(row.id);
      window.notify?.success('تمت الموافقة على الطلب وتحويله إلى عضو بنجاح');
      load();
    } catch (err) {
      window.notify?.fromError(err, 'تعذر قبول الطلب');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async (row) => {
    const reason = rejectReason.trim();
    closeModal();
    setBusy(true);
    window.notify?.loading('جاري رفض الطلب...');
    try {
      await rejectMembershipRequest(row.id, reason);
      window.notify?.success('تم رفض الطلب');
      load();
    } catch (err) {
      window.notify?.fromError(err, 'تعذر رفض الطلب');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader title="طلبات الانخراط" subtitle="مراجعة طلبات الانضمام إلى الجمعية والموافقة عليها أو رفضها" />

      <div className="admin-tabs">
        {Object.keys(TAB_LABEL).map((key) => (
          <button key={key} className={`admin-tab-btn${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            {TAB_LABEL[key]}
          </button>
        ))}
      </div>

      <div className="admin-panel">
        {rows === null && !error && <div className="admin-state-box">جاري التحميل...</div>}
        {error && <div className="admin-state-box">تعذر تحميل الطلبات.</div>}
        {rows && rows.length === 0 && <div className="admin-state-box">لا توجد طلبات {TAB_LABEL[tab]} حاليًا.</div>}
        {rows && rows.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>الاسم</th><th>البريد</th><th>الهاتف</th><th>الدفعة</th><th>المدينة</th><th>التاريخ</th><th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.full_name}</td>
                    <td>{r.email}</td>
                    <td>{FIELD(r.phone)}</td>
                    <td>{FIELD(r.promotion)}</td>
                    <td>{FIELD(r.city)}</td>
                    <td>{new Date(r.created_at).toLocaleDateString('ar-MA')}</td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setModal({ type: 'view', row: r })}>
                        عرض
                      </button>
                      {tab === 'pending' && (
                        <>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            disabled={busy}
                            onClick={() => setModal({ type: 'approve', row: r })}
                          >
                            قبول
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            disabled={busy}
                            onClick={() => setModal({ type: 'reject', row: r })}
                          >
                            رفض
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal?.type === 'view' && (
        <Modal onClose={closeModal}>
          <h3>تفاصيل الطلب</h3>
          <p><strong>الاسم:</strong> {modal.row.full_name}</p>
          <p><strong>البريد:</strong> {modal.row.email}</p>
          <p><strong>الهاتف:</strong> {FIELD(modal.row.phone)}</p>
          <p><strong>الدفعة:</strong> {FIELD(modal.row.promotion)}</p>
          <p><strong>الشعبة:</strong> {FIELD(modal.row.track)}</p>
          <p><strong>المهنة:</strong> {FIELD(modal.row.profession)}</p>
          <p><strong>المدينة:</strong> {FIELD(modal.row.city)}</p>
          <p><strong>الرسالة:</strong> {FIELD(modal.row.message)}</p>
          {modal.row.rejection_reason && <p><strong>سبب الرفض:</strong> {modal.row.rejection_reason}</p>}
          <div className="admin-modal-actions">
            <button className="admin-btn admin-btn-ghost" onClick={closeModal}>إغلاق</button>
          </div>
        </Modal>
      )}

      {modal?.type === 'approve' && (
        <Modal onClose={closeModal}>
          <h3>تأكيد القبول</h3>
          <p>سيتم قبول طلب <strong>{modal.row.full_name}</strong> وتحويله تلقائيًا إلى عضو نشط في الجمعية. هل تريد المتابعة؟</p>
          <div className="admin-modal-actions">
            <button className="admin-btn admin-btn-primary" onClick={() => doApprove(modal.row)}>تأكيد القبول</button>
            <button className="admin-btn admin-btn-ghost" onClick={closeModal}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal?.type === 'reject' && (
        <Modal onClose={closeModal}>
          <h3>رفض الطلب</h3>
          <p>رفض طلب <strong>{modal.row.full_name}</strong>.</p>
          <div className="admin-form-group">
            <label htmlFor="rejectReason">سبب الرفض (اختياري)</label>
            <textarea
              id="rejectReason"
              className="admin-textarea"
              placeholder="اكتب السبب إن وجد..."
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="admin-modal-actions">
            <button className="admin-btn admin-btn-danger" onClick={() => doReject(modal.row)}>تأكيد الرفض</button>
            <button className="admin-btn admin-btn-ghost" onClick={closeModal}>إلغاء</button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
