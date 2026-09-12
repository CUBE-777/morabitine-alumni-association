import { supabase } from './client';
import { logAction } from './auth.service';

export async function fetchBoardMembers() {
  const { data, error } = await supabase.from('board_members').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function swapBoardOrder(a, b) {
  await supabase.from('board_members').update({ sort_order: b.sort_order }).eq('id', a.id);
  await supabase.from('board_members').update({ sort_order: a.sort_order }).eq('id', b.id);
}

export async function saveBoardMember(existing, payload) {
  if (existing) {
    const { error } = await supabase.from('board_members').update(payload).eq('id', existing.id);
    if (error) throw error;
    await logAction('ADMIN_UPDATED_BOARD_MEMBER', 'board_members', existing.id, `تعديل بيانات عضو المكتب ${payload.full_name}`);
  } else {
    const { count } = await supabase.from('board_members').select('id', { count: 'exact', head: true });
    const insertPayload = { ...payload, sort_order: count || 0 };
    const { data, error } = await supabase.from('board_members').insert(insertPayload).select().single();
    if (error) throw error;
    await logAction('ADMIN_CREATED_BOARD_MEMBER', 'board_members', data?.id || null, `إضافة عضو مكتب جديد: ${payload.full_name}`);
  }
}

export async function deleteBoardMember(member) {
  const { error } = await supabase.from('board_members').delete().eq('id', member.id);
  if (error) throw error;
  await logAction('ADMIN_DELETED_BOARD_MEMBER', 'board_members', member.id, `حذف عضو المكتب ${member.full_name}`);
}
