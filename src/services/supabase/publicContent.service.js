/**
 * src/services/supabase/publicContent.service.js
 * كل استعلامات القراءة العامة المستخدمة في الصفحة الرئيسية (index.html الأصلي):
 * activities, gallery, site_settings, site_content, announcements.
 * منطق كل دالة مطابق 1:1 لما كان مضمّنًا سابقًا داخل <script> في index.html.
 */
import { supabase } from './client';

export async function fetchPublishedActivities(limit = 8) {
  const { data, error } = await supabase
    .from('activities')
    .select('slug, title, description, category')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchGalleryItems(limit = 12) {
  const { data, error } = await supabase
    .from('gallery')
    .select('image_url, title, description')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) throw error;
  const settings = {};
  (data || []).forEach((row) => {
    if (row.value) settings[row.key] = row.value;
  });
  return settings;
}

export async function fetchSiteContent() {
  const { data, error } = await supabase.from('site_content').select('section, key, value');
  if (error) throw error;
  const content = {};
  (data || []).forEach((row) => {
    if (row.value != null && row.value !== '') content[`${row.section}.${row.key}`] = row.value;
  });
  return content;
}

/** يُرجع الإعلان النشط الوحيد ضمن الفترة الزمنية الحالية، أو null. */
export async function fetchActiveAnnouncement() {
  const now = Date.now();
  const { data, error } = await supabase
    .from('announcements')
    .select('id, text, link, start_at, end_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  const active = (data || []).find((row) => {
    const afterStart = !row.start_at || new Date(row.start_at).getTime() <= now;
    const beforeEnd = !row.end_at || new Date(row.end_at).getTime() >= now;
    return afterStart && beforeEnd;
  });
  return active || null;
}

export async function submitMembershipRequest(payload) {
  const { error } = await supabase.from('membership_requests').insert(payload);
  if (error) throw error;
}

export async function submitContactMessage(payload) {
  // ملاحظة: النموذج الأصلي (contact) كان يعتمد Netlify Forms (data-netlify) وليس
  // Supabase، بعكس نموذج الانخراط الذي هُجِّر بالفعل إلى membership_requests
  // (انظر AUDIT_REPORT.md وتعليق index.html). أُبقي نفس السلوك هنا لعدم كسر آلية
  // استقبال الرسائل الحالية — Netlify Forms يعمل بإرسال POST عادي لنفس الصفحة.
  const body = new URLSearchParams({ 'form-name': 'contact', ...payload }).toString();
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Netlify form submission failed');
}
