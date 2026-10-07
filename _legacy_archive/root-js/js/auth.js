/**
 * js/auth.js
 * إدارة الدخول/الخروج/الجلسة وحماية صفحات لوحة الإدارة.
 * يتطلب تحميل js/supabase.js و js/notifications.js قبله.
 */

const Auth = {
  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    await sb.auth.signOut();
    window.location.href = 'login.html';
  },

  async getSession() {
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  /**
   * يُرجع صف profiles الخاص بالمستخدم الحالي (يحتوي role, full_name, is_active...)
   * أو null إن لم يكن مسجّلاً / ليس له صف profile.
   */
  async getProfile() {
    const session = await this.getSession();
    if (!session) return null;
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (error) return null;
    return data;
  },

  /**
   * يُستدعى في أعلى كل صفحة إدارية محمية.
   * - إن لم توجد جلسة → يحوّل إلى login.html
   * - إن وجدت جلسة لكن لا يوجد profile نشط → يسجّل الخروج ويحوّل مع رسالة
   * - إن طُلبت أدوار محددة (roles) ولم يطابقها دور المستخدم → يمنع الوصول
   * يُرجع الـ profile عند النجاح.
   */
  async requireAuth(allowedRoles) {
    const session = await this.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    const profile = await this.getProfile();
    if (!profile || !profile.is_active) {
      await sb.auth.signOut();
      window.location.href = 'login.html?reason=inactive';
      return null;
    }
    if (Array.isArray(allowedRoles) && allowedRoles.length && !allowedRoles.includes(profile.role)) {
      document.body.innerHTML = `
        <div dir="rtl" style="min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Tajawal',sans-serif; text-align:center; padding:24px;">
          <div>
            <h1 style="margin-bottom:12px;">غير مصرح لك بالوصول</h1>
            <p style="color:#5b6784; margin-bottom:20px;">لا تملك الصلاحية الكافية لعرض هذه الصفحة.</p>
            <a href="dashboard.html" style="color:#173a7d; font-weight:700;">العودة للوحة الرئيسية</a>
          </div>
        </div>`;
      return null;
    }
    return profile;
  },

  /** تسجيل عملية في audit_logs */
  async log(action, entityType, entityId, description, metadata) {
    const session = await this.getSession();
    if (!session) return;
    await sb.from('audit_logs').insert({
      user_id: session.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      description: description || null,
      metadata: metadata || null
    });
  }
};

// إنهاء الجلسة تلقائيًا من كل تبويبات المتصفح عند تسجيل الخروج من أحدها
sb.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT' && !location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
});
