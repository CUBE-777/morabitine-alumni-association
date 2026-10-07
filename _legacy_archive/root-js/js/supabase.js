/**
 * js/supabase.js
 * نقطة الاتصال الموحّدة بـ Supabase — يُحمَّل هذا الملف في كل صفحة تحتاج بيانات
 * من القاعدة (الموقع العام + لوحة الإدارة).
 *
 * ملاحظة أمان: المفتاح أدناه هو "publishable key" (يقابل anon key سابقًا).
 * هذا المفتاح آمن للظهور في كود المتصفح — فهو لا يمنح أي صلاحية كتابة أو قراءة
 * حساسة إلا وفق سياسات RLS المفعّلة صراحة في قاعدة البيانات (انظر supabase/migrations/0003).
 * لا تضع هنا أبدًا service_role / secret key.
 *
 * يتطلب أن تكون مكتبة supabase-js محمّلة قبل هذا الملف عبر:
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */

const SUPABASE_URL = 'https://qkankovqhgofaytkcuat.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_w9yUW05zMbLsSw_ffDXovw_wlHOByNv';

if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  console.error('supabase-js غير محمّلة. تأكد من إضافة <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> قبل js/supabase.js');
}

// عميل Supabase الموحّد — متاح عالميًا عبر window.sb في كل الملفات الأخرى
window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
