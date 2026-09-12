import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

/**
 * يطابق سلوك Auth.requireAuth(allowedRoles) الأصلي:
 * - لا جلسة → إعادة توجيه إلى /admin/login
 * - جلسة بلا profile نشط → تسجيل خروج وإعادة توجيه مع reason=inactive
 * - profile موجود لكن دوره غير مسموح → رسالة "غير مصرح لك بالوصول" (بدل تحويل)
 */
export default function ProtectedRoute({ roles, children }) {
  const { status, profile, logout } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8f9bc4' }}>
        جاري التحقق من الجلسة...
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!profile || !profile.is_active) {
    logout();
    return <Navigate to="/admin/login?reason=inactive" replace />;
  }

  if (Array.isArray(roles) && roles.length && !roles.includes(profile.role)) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Tajawal', sans-serif",
          textAlign: 'center',
          padding: 24,
          background: 'var(--admin-bg)',
          color: 'var(--admin-text)',
        }}
      >
        <div>
          <h1 style={{ marginBottom: 12 }}>غير مصرح لك بالوصول</h1>
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: 20 }}>لا تملك الصلاحية الكافية لعرض هذه الصفحة.</p>
          <a href="/admin/dashboard" style={{ color: 'var(--admin-accent)', fontWeight: 700 }}>
            العودة للوحة الرئيسية
          </a>
        </div>
      </div>
    );
  }

  return children;
}
