import { supabase } from './client';
import { logAction } from './auth.service';

export const SETTINGS_GROUPS = [
  {
    title: 'عام',
    keys: [
      ['association_name', 'اسم الجمعية'],
      ['email', 'البريد الإلكتروني'],
      ['phone', 'الهاتف'],
      ['address', 'العنوان'],
    ],
  },
  {
    title: 'التواصل الاجتماعي',
    keys: [
      ['whatsapp', 'واتساب (بدون +)'],
      ['facebook', 'رابط فيسبوك'],
      ['instagram', 'رابط إنستغرام'],
      ['youtube', 'رابط يوتيوب'],
    ],
  },
  { title: 'الخريطة', keys: [['google_maps_url', 'رابط خرائط Google']] },
];

export async function fetchSiteSettingsAdmin() {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  return data || [];
}

export async function saveSiteSettings(rows) {
  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
  await logAction('ADMIN_UPDATED_SETTINGS', 'site_settings', null, 'تحديث الإعدادات العامة');
}
