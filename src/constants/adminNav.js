/**
 * src/constants/adminNav.js
 * مصفوفة تنقل لوحة الإدارة (نفس المفاتيح/الأدوار/الترتيب). `labelKey`/`sectionKey`
 * مفاتيح ترجمة تحت admin.nav.* ؛ `label`/`section` نص عربي احتياطي فقط.
 */
export const ADMIN_NAV = [
  { key: 'dashboard', labelKey: 'dashboard', label: 'لوحة القيادة', href: '/admin/dashboard', icon: 'layout-dashboard', roles: [] },
  { sectionKey: 'sectionMembers', section: 'إدارة الأعضاء' },
  { key: 'members', labelKey: 'members', label: 'جميع الأعضاء', href: '/admin/members', icon: 'users', roles: ['super_admin', 'members_manager'] },
  { key: 'requests', labelKey: 'requests', label: 'طلبات الانخراط', href: '/admin/requests', icon: 'user-plus', roles: ['super_admin', 'members_manager'] },
  { key: 'board', labelKey: 'board', label: 'أعضاء المكتب', href: '/admin/board', icon: 'shield', roles: ['super_admin', 'editor'] },
  { sectionKey: 'sectionContent', section: 'المحتوى' },
  { key: 'activities', labelKey: 'activities', label: 'الأنشطة', href: '/admin/activities', icon: 'calendar', roles: ['super_admin', 'editor'] },
  { key: 'gallery', labelKey: 'gallery', label: 'معرض الصور', href: '/admin/gallery', icon: 'image', roles: ['super_admin', 'editor'] },
  { key: 'announcements', labelKey: 'announcements', label: 'الإعلانات', href: '/admin/announcements', icon: 'megaphone', roles: ['super_admin', 'editor'] },
  { key: 'content', labelKey: 'content', label: 'محتوى الموقع', href: '/admin/content', icon: 'file-text', roles: ['super_admin', 'editor'] },
  { sectionKey: 'sectionAdmin', section: 'الإدارة' },
  { key: 'admins', labelKey: 'admins', label: 'المستخدمون الإداريون', href: '/admin/admins', icon: 'user-cog', roles: ['super_admin'] },
  { key: 'audit', labelKey: 'audit', label: 'سجل العمليات', href: '/admin/audit', icon: 'history', roles: ['super_admin'] },
  { key: 'settings', labelKey: 'settings', label: 'الإعدادات العامة', href: '/admin/settings', icon: 'settings', roles: ['super_admin'] },
];
