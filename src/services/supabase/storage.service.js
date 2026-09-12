import { supabase } from './client';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** يرفع صورة إلى bucket "association-media" ويُرجع الرابط العام، مطابق تمامًا لسلوك uploadFile() الأصلي. */
export async function uploadImage(file, folder) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم، استخدم صورة JPG أو PNG أو WEBP.');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('حجم الملف أكبر من 5MB.');
  }
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const { error } = await supabase.storage.from('association-media').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('association-media').getPublicUrl(path);
  return data.publicUrl;
}
