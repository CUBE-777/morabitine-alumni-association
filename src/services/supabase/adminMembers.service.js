import { supabase } from './client';
import { logAction } from './auth.service';
import { runWithColumnFallback } from './profileColumns';

const PAGE_SIZE = 15;
export { PAGE_SIZE };

export async function fetchMembersPage({ page, search, status }) {
  let query = supabase.from('members').select('*', { count: 'exact' }).is('deleted_at', null);
  if (status) query = query.eq('status', status);
  if (search) {
    const s = search.replace(/[%_]/g, '');
    query = query.or(`full_name.ilike.%${s}%,profession.ilike.%${s}%,city.ilike.%${s}%,promotion.ilike.%${s}%,university.ilike.%${s}%`);
  }
  const from = (page - 1) * PAGE_SIZE;
  query = query.order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data || [], total: count || 0 };
}

// يُرجع degraded=true إن حُفظت البيانات الأساسية فقط لأن أعمدة الملف العام/الترجمات غير موجودة بعد.
export async function createMember(payload) {
  const { res, degraded } = await runWithColumnFallback(
    (p) => supabase.from('members').insert(p).select().single(),
    payload
  );
  if (res.error) throw res.error;
  await logAction('ADMIN_CREATED_MEMBER', 'members', res.data.id, `إضافة عضو جديد: ${payload.full_name}`);
  return { ...res.data, degraded };
}

export async function updateMember(id, payload) {
  const { res, degraded } = await runWithColumnFallback(
    (p) => supabase.from('members').update(p).eq('id', id),
    payload
  );
  if (res.error) throw res.error;
  await logAction('ADMIN_UPDATED_MEMBER', 'members', id, `تعديل بيانات العضو ${payload.full_name}`);
  return { degraded };
}

export async function softDeleteMember(member) {
  const { error } = await supabase.from('members').update({ deleted_at: new Date().toISOString() }).eq('id', member.id);
  if (error) throw error;
  await logAction('ADMIN_DELETED_MEMBER', 'members', member.id, `حذف العضو ${member.full_name}`);
}

export async function fetchAllMembersForExport() {
  const { data, error } = await supabase
    .from('members')
    .select('full_name,university,promotion,track,profession,city,email,phone,status')
    .is('deleted_at', null);
  if (error) throw error;
  return data || [];
}
