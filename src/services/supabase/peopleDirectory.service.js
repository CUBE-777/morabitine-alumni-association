import { supabase } from './client';

function memberRowToPerson(row) {
  return {
    name: row.full_name,
    role: 'عضو الجمعية',
    university: row.university,
    // ملاحظة أمان/خصوصية: لا يُطلب حقل "age" هنا لأن قاعدة البيانات لا تمنح anon
    // صلاحية قراءته إطلاقًا (انظر supabase/migrations/0007_member_privacy.sql).
    // نفس الأمر لـ email/phone/city — تبقى خاصة بالإدارة فقط.
    promo: row.promotion,
    track: row.track,
    profession: row.profession,
    image: row.photo_url,
  };
}

function boardRowToPerson(row) {
  return {
    name: row.full_name,
    role: row.position,
    university: row.university,
    age: null,
    promo: null,
    track: null,
    profession: row.bio, // نعرض النبذة في مكان "المهنة/التخصص" حتى لا نضيف حقلاً جديدًا للبطاقة
    image: row.photo_url,
  };
}

export async function fetchPeopleDirectory(listKey) {
  if (listKey === 'board') {
    const { data, error } = await supabase
      .from('board_members')
      .select('id, full_name, position, photo_url, university, bio, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(boardRowToPerson);
  }
  // نطلب فقط الأعمدة العامة غير الحساسة (RLS يرفض الباقي أصلاً لدور anon).
  const { data, error } = await supabase
    .from('members')
    .select('id, full_name, photo_url, promotion, track, university, profession, status, created_at, deleted_at')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(memberRowToPerson);
}
