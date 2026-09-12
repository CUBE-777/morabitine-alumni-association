import { supabase } from './client';

export async function fetchActivityBySlug(slug) {
  const { data, error } = await supabase
    .from('activities')
    .select('slug, title, description, category, target_audience, date, time, location, cover_image_url, sub_activities')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    title: data.title,
    date: data.date ? new Date(data.date).toLocaleDateString('ar-MA') : null,
    location: data.location,
    category: data.category,
    target: data.target_audience,
    image: data.cover_image_url,
    content: data.description,
    sub_activities: Array.isArray(data.sub_activities) ? data.sub_activities : [],
  };
}
