import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, CalendarPlus, ImagePlus, FileEdit } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAuth } from '../../app/providers/AuthProvider';
import { fetchDashboardStats, fetchRecentMembershipRequests, fetchRecentAuditLogs } from '../../services/supabase/dashboard.service';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);
  const [requests, setRequests] = useState(null);
  const [requestsState, setRequestsState] = useState('loading'); // loading | ok | forbidden | error
  const [audit, setAudit] = useState(null);
  const [auditState, setAuditState] = useState('loading');

  useEffect(() => {
    document.title = 'لوحة القيادة — لوحة إدارة الجمعية';

    fetchDashboardStats()
      .then(setStats)
      .catch((err) => {
        console.error('تعذر تحميل الإحصائيات:', err);
        setStatsError(true);
      });

    if (['super_admin', 'members_manager'].includes(profile.role)) {
      fetchRecentMembershipRequests()
        .then((data) => {
          setRequests(data);
          setRequestsState('ok');
        })
        .catch((err) => {
          console.error('تعذر تحميل الطلبات:', err);
          setRequestsState('error');
        });
    } else {
      setRequestsState('forbidden');
    }

    if (profile.role === 'super_admin') {
      fetchRecentAuditLogs()
        .then((data) => {
          setAudit(data);
          setAuditState('ok');
        })
        .catch((err) => {
          console.error('تعذر تحميل سجل العمليات:', err);
          setAuditState('error');
        });
    } else {
      setAuditState('forbidden');
    }
  }, [profile.role]);

  return (
    <AdminLayout>
      <AdminPageHeader
        title={`مرحبًا، ${profile.full_name.split(' ')[0]}`}
        subtitle="نظرة سريعة على نشاط الجمعية اليوم"
        actions={
          <>
            <Link to="/admin/members" className="admin-quick-action"><UserPlus size={15} /> إضافة عضو</Link>
            <Link to="/admin/activities" className="admin-quick-action"><CalendarPlus size={15} /> إضافة نشاط</Link>
            <Link to="/admin/gallery" className="admin-quick-action"><ImagePlus size={15} /> رفع صور</Link>
            <Link to="/admin/content" className="admin-quick-action"><FileEdit size={15} /> تعديل المحتوى</Link>
          </>
        }
      />

      <div className="admin-stat-grid">
        {(stats || Array(4).fill(null)).map((s, i) => (
          <div className="admin-stat-card" key={i}>
            <div className="admin-stat-label">{s ? s.label : '...'}</div>
            <div className="admin-stat-value">{s ? s.value : '–'}</div>
          </div>
        ))}
      </div>
      {statsError && <div className="admin-state-box">تعذر تحميل الإحصائيات.</div>}

      <div className="admin-panel">
        <h2>آخر طلبات الانخراط</h2>
        {requestsState === 'loading' && <div className="admin-state-box">جاري التحميل...</div>}
        {requestsState === 'forbidden' && <div className="admin-state-box">لا تملك صلاحية عرض هذا القسم.</div>}
        {requestsState === 'error' && <div className="admin-state-box">تعذر تحميل الطلبات.</div>}
        {requestsState === 'ok' && requests.length === 0 && <div className="admin-state-box">لا توجد طلبات بعد.</div>}
        {requestsState === 'ok' && requests.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr><th>الاسم</th><th>البريد</th><th>الحالة</th><th>التاريخ</th></tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.full_name}</td>
                    <td>{r.email}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{new Date(r.created_at).toLocaleDateString('ar-MA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-panel">
        <h2>آخر العمليات الإدارية</h2>
        {auditState === 'loading' && <div className="admin-state-box">جاري التحميل...</div>}
        {auditState === 'forbidden' && <div className="admin-state-box">لا تملك صلاحية عرض هذا القسم.</div>}
        {auditState === 'error' && <div className="admin-state-box">تعذر تحميل السجل.</div>}
        {auditState === 'ok' && audit.length === 0 && <div className="admin-state-box">لا توجد عمليات مسجّلة بعد.</div>}
        {auditState === 'ok' && audit.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr><th>العملية</th><th>الوصف</th><th>التاريخ</th></tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td>{a.action}</td>
                    <td>{a.description || '—'}</td>
                    <td>{new Date(a.created_at).toLocaleString('ar-MA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
