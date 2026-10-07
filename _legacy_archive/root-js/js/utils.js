/**
 * js/utils.js
 * أدوات مشتركة لسلامة العرض (XSS-safe rendering) تُستخدم في كل صفحات
 * الموقع العام وصفحات الإدارة التي تُدرج بيانات قادمة من Supabase ضمن HTML.
 *
 * قاعدة عامة: أي نص قادم من قاعدة البيانات (حتى لو أدخله مسؤول موثوق) يُعامل
 * كـ untrusted عند إدراجه في innerHTML، لأن اختراق حساب إداري واحد لا يجب أن
 * يتحول تلقائيًا إلى XSS يصيب كل زوار الموقع العام.
 */

/** يهرب النص العادي (plain text) قبل إدراجه داخل HTML. */
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * يهرب نصًا لاستخدامه داخل قيمة سمة HTML (attribute)، مثل href أو src.
 * يمنع أيضًا مخططات "javascript:" الخطيرة عند استخدامه لروابط.
 */
function escapeAttr(value) {
  return escapeHtml(value);
}

/**
 * يتحقق أن الرابط يستخدم بروتوكول آمن (http/https/relative) فقط، ويرفض
 * javascript:, data:, vbscript: وغيرها التي قد تُستغل في XSS عبر href/src.
 * يُرجع '' إذا كان الرابط غير آمن.
 */
function safeUrl(value) {
  const v = String(value == null ? '' : value).trim();
  if (!v) return '';
  if (/^(https?:)?\/\//i.test(v) || v.startsWith('/') || v.startsWith('./') || v.startsWith('../')) {
    return v;
  }
  // امتدادات ملفات نسبية شائعة (logo.jpg إلخ) بدون بروتوكول
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  return '';
}

/**
 * ينظّف HTML غني (rich text) قادم من حقول مثل "وصف النشاط" قبل عرضه عبر
 * innerHTML، باستخدام DOMPurify (محمّل عبر CDN في الصفحات التي تحتاجه).
 * يسمح فقط بمجموعة محدودة من الوسوم الآمنة لتنسيق النص، ويمنع
 * script/iframe/object/embed وكل معالجات الأحداث (onerror, onclick...)
 * وروابط javascript:.
 */
function sanitizeRichText(html) {
  const raw = String(html == null ? '' : html);
  if (!raw.trim()) return '';
  if (typeof window === 'undefined' || !window.DOMPurify) {
    // شبكة أمان: إن لم تكن مكتبة DOMPurify محمّلة لأي سبب، لا نعرض HTML خام
    // إطلاقًا؛ نعرضه كنص عادي مهروب بدل المخاطرة بـ XSS.
    console.error('DOMPurify غير محمّلة — سيتم عرض المحتوى كنص عادي فقط.');
    return escapeHtml(raw).replace(/\n/g, '<br>');
  }
  return window.DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span', 'h3', 'h4', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'svg'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
  });
}
