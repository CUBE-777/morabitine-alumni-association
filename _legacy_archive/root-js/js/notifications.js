/**
 * js/notifications.js
 * نظام Toast/Notification موحّد — يُستخدم بدل alert() في كل لوحة الإدارة.
 * الاستخدام: notify.success('تم الحفظ بنجاح'); notify.error('تعذر الحفظ'); notify.loading('جاري الحفظ...')
 */

(function () {
  function ensureContainer() {
    let el = document.getElementById('toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-container';
      el.setAttribute('dir', 'rtl');
      el.style.cssText = `
        position: fixed; top: 20px; left: 20px; z-index: 9999;
        display: flex; flex-direction: column; gap: 10px;
        max-width: 340px; font-family: 'Tajawal', sans-serif;
      `;
      document.body.appendChild(el);
    }
    return el;
  }

  const STYLES = {
    success: { bg: '#1f7a4d', icon: '✓' },
    error:   { bg: '#b3261e', icon: '✕' },
    loading: { bg: '#173a7d', icon: '…' },
    info:    { bg: '#5b6784', icon: 'ℹ' }
  };

  function show(type, message, opts) {
    opts = opts || {};
    const container = ensureContainer();
    const s = STYLES[type] || STYLES.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
      background:${s.bg}; color:#fff; padding:14px 16px; border-radius:10px;
      box-shadow:0 8px 24px rgba(0,0,0,.18); display:flex; align-items:center; gap:10px;
      font-size:.92rem; line-height:1.5; animation: toast-in .25s ease;
    `;
    // إصلاح: الرسالة كانت تُدرج داخل innerHTML مباشرة بدون تهريب. كل الاستخدامات
    // الحالية في المشروع تمرر نصوصًا ثابتة أو أرقامًا فقط، لذا لم تكن هناك ثغرة
    // مستغَلة فعليًا، لكن أي استدعاء مستقبلي يمرر نصًا قادمًا من بيانات (اسم عضو،
    // عنوان نشاط...) كان سيفتح XSS مباشرة. تم تهريب النص هنا كخط دفاع إضافي.
    const safeMessage = String(message == null ? '' : message)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    toast.innerHTML = `<span style="font-weight:700;">${s.icon}</span><span>${safeMessage}</span>`;
    container.appendChild(toast);

    if (type !== 'loading') {
      const duration = opts.duration || 4000;
      setTimeout(() => {
        toast.style.transition = 'opacity .25s ease, transform .25s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-12px)';
        setTimeout(() => toast.remove(), 250);
      }, duration);
    }
    return toast;
  }

  if (!document.getElementById('toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'toast-keyframes';
    style.textContent = `@keyframes toast-in { from{opacity:0; transform:translateX(-12px);} to{opacity:1; transform:translateX(0);} }`;
    document.head.appendChild(style);
  }

  window.notify = {
    success: (msg) => show('success', msg),
    error: (msg) => show('error', msg),
    info: (msg) => show('info', msg),
    // يُعيد عنصر التحميل حتى تتمكن من إغلاقه يدويًا: const t = notify.loading('...'); t.remove();
    loading: (msg) => show('loading', msg || 'جاري التحميل...')
  };

  // ترجمة أخطاء Supabase الشائعة لرسائل عربية مفهومة
  window.notify.fromError = function (err, fallback) {
    const raw = (err && (err.message || err.error_description || String(err))) || '';
    let msg = fallback || 'حدث خطأ غير متوقع، حاول مرة أخرى.';
    if (/permission|policy|RLS/i.test(raw)) msg = 'ليست لديك صلاحية لتنفيذ هذه العملية.';
    else if (/duplicate|unique/i.test(raw)) msg = 'هذا السجل موجود مسبقًا.';
    else if (/network|fetch/i.test(raw)) msg = 'تعذر الاتصال بالخادم، تحقق من الإنترنت.';
    else if (/JWT|auth|session/i.test(raw)) msg = 'انتهت الجلسة، الرجاء تسجيل الدخول من جديد.';
    show('error', msg);
    console.error('Supabase error:', raw);
  };
})();
