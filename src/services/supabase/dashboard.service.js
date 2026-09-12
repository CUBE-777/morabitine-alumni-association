import { supabase } from './client';

export async function fetchDashboardStats() {
  const [members, pending, activities, gallery] = await Promise.all([
    supabase.from('members').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('membership_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('activities').select('id', { count: 'exact', head: true }).eq('status', 'published').is('deleted_at', null),
    supabase.from('gallery').select('id', { count: 'exact', head: true }).is('deleted_at', null),
  ]);
  return [
    { label: 'إجمالي الأعضاء', value: members.count ?? 0 },
    { label: 'طلبات معلّقة', value: pending.count ?? 0 },
    { label: 'أنشطة منشورة', value: activities.count ?? 0 },
    { label: 'صور المعرض', value: gallery.count ?? 0 },
  ];
}

export async function fetchRecentMembershipRequests(limit = 5) {
  const { data, error } = await supabase
    .from('membership_requests')
    .select('id, full_name, email, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchRecentAuditLogs(limit = 6) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, description, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
