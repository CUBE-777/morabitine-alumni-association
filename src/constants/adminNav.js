/**
 * src/constants/adminNav.js
 * منفذ حرفي لمصفوفة links في js/admin-layout.js الأصلي (نفس المفاتيح/الأدوار/الترتيب).
 * الأيقونات جديدة (لم تكن موجودة أصلاً) — إضافة بصرية فقط ضمن إعادة التصميم.
 */
export const ADMIN_NAV = [
  { key: 'dashboard', label: 'لوحة القيادة', href: '/admin/dashboard', icon: 'layout-dashboard', roles: [] },
  { section: 'إدارة الأعضاء' },
  { key: 'members', label: 'جميع الأعضاء', href: '/admin/members', icon: 'users', roles: ['super_admin', 'members_manager'] },
  { key: 'requests', label: 'طلبات الانخراط', href: '/admin/requests', icon: 'user-plus', roles: ['super_admin', 'members_manager'] },
  { key: 'board', label: 'أعضاء المكتب', href: '/admin/board', icon: 'shield', roles: ['super_admin', 'editor'] },
  { section: 'المحتوى' },
  { key: 'activities', label: 'الأنشطة', href: '/admin/activities', icon: 'calendar', roles: ['super_admin', 'editor'] },
  { key: 'gallery', label: 'معرض الصور', href: '/admin/gallery', icon: 'image', roles: ['super_admin', 'editor'] },
  { key: 'announcements', label: 'الإعلانات', href: '/admin/announcements', icon: 'megaphone', roles: ['super_admin', 'editor'] },
  { key: 'content', label: 'محتوى الموقع', href: '/admin/content', icon: 'file-text', roles: ['super_admin', 'editor'] },
  { section: 'الإدارة' },
  { key: 'admins', label: 'المستخدمون الإداريون', href: '/admin/admins', icon: 'user-cog', roles: ['super_admin'] },
  { key: 'audit', label: 'سجل العمليات', href: '/admin/audit', icon: 'history', roles: ['super_admin'] },
  { key: 'settings', label: 'الإعدادات العامة', href: '/admin/settings', icon: 'settings', roles: ['super_admin'] },
];
