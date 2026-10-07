import { supabase } from './client';
import { logAction } from './auth.service';

export const CONTENT_FIELDS = [
  { section: 'homepage', key: 'hero_title', label: 'عنوان الصفحة الرئيسية (Hero)' },
  { section: 'homepage', key: 'about_title', label: 'عنوان قسم من نحن' },
  { section: 'footer', key: 'copyright', label: 'نص حقوق النشر بالفوتر' },
];

export async function fetchSiteContentAdmin() {
  const { data, error } = await supabase.from('site_content').select('*');
  if (error) throw error;
  return data || [];
}

export async function saveSiteContent(rows) {
  const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'section,key' });
  if (error) throw error;
  await logAction('ADMIN_UPDATED_CONTENT', 'site_content', null, 'تحديث محتوى الموقع');
}
