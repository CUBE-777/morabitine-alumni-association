import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import '../../styles/admin-login.css';

export default function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'تسجيل الدخول — لوحة إدارة الجمعية';
  }, []);

  // إن كانت هناك جلسة نشطة بالفعل، انتقل مباشرة إلى لوحة التحكم (سلوك مطابق للأصل)
  useEffect(() => {
    if (status === 'authenticated') navigate('/admin/dashboard', { replace: true });
  }, [status, navigate]);

  useEffect(() => {
    if (searchParams.get('reason') === 'inactive') {
      setError('تم تعطيل حسابك، تواصل مع المسؤول الأعلى.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = /Invalid login credentials/i.test(err.message || '')
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
        : err.message || 'تعذر تسجيل الدخول، حاول مرة أخرى.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-box" onSubmit={handleSubmit} noValidate>
        <img src="/logo.jpg" alt="شعار الجمعية" />
        <h1>لوحة إدارة الجمعية</h1>
        <p className="sub">جمعية خريجي ثانوية المرابطين ببيوكرة</p>

        {error && <div className="admin-login-error">{error}</div>}

        <div className="admin-login-group">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="admin-login-group">
          <label htmlFor="password">كلمة المرور</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>
        <Link to="/" className="admin-login-back">← العودة إلى الموقع الرئيسي</Link>
      </form>
    </div>
  );
}
