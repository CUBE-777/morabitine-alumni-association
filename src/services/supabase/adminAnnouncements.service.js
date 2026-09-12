import { supabase } from './client';
import { logAction } from './auth.service';

export async function fetchAnnouncementsAdmin() {
  const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveAnnouncement(existing, payload) {
  if (existing) {
    const { error } = await supabase.from('announcements').update(payload).eq('id', existing.id);
    if (error) throw error;
    await logAction('ADMIN_UPDATED_ANNOUNCEMENT', 'announcements', existing.id, `تعديل إعلان: ${payload.text.slice(0, 60)}`);
  } else {
    const { data, error } = await supabase.from('announcements').insert(payload).select().single();
    if (error) throw error;
    await logAction('ADMIN_CREATED_ANNOUNCEMENT', 'announcements', data?.id || null, `إضافة إعلان جديد: ${payload.text.slice(0, 60)}`);
  }
}

export async function deleteAnnouncement(announcement) {
  const { error } = await supabase.from('announcements').delete().eq('id', announcement.id);
  if (error) throw error;
  await logAction('ADMIN_DELETED_ANNOUNCEMENT', 'announcements', announcement.id, `حذف إعلان: ${(announcement.text || '').slice(0, 60)}`);
}
