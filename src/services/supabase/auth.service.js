/**
 * src/services/supabase/auth.service.js
 * منفذ حرفي للمنطق الأساسي في js/auth.js الأصلي (login/logout/session/profile/log).
 * منطق "requireAuth" (التحويل + فحص الأدوار) انتقل إلى مكوّن React
 * `ProtectedRoute` بدل دالة إجرائية، لأن React Router يتولى التوجيه.
 */
import { supabase } from './client';

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** يُرجع صف profiles الخاص بالمستخدم الحالي (role/full_name/is_active...) أو null. */
export async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  if (error) return null;
  return data;
}

export async function logAction(action, entityType, entityId, description, metadata) {
  const session = await getSession();
  if (!session) return;
  await supabase.from('audit_logs').insert({
    user_id: session.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    description: description || null,
    metadata: metadata || null,
  });
}

export const ROLE_LABELS = {
  super_admin: 'مسؤول أعلى',
  editor: 'محرر',
  members_manager: 'مسؤول الأعضاء',
};
