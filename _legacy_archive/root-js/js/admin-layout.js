/**
 * js/admin-layout.js
 * يبني الشريط الجانبي (Sidebar) وشريط الجوال العلوي في كل صفحات لوحة الإدارة،
 * ويُظهر فقط الروابط التي يسمح بها دور المستخدم الحالي.
 * الاستخدام في كل صفحة إدارية:
 *   const profile = await Auth.requireAuth();
 *   if (!profile) return; // requireAuth already redirected
 *   AdminLayout.render(profile, 'members'); // 'members' = مفتاح الصفحة النشطة
 */

const AdminLayout = {
  // كل رابط: key فريد، label عربي، href، وrolesAllowed (فارغ = الجميع)
  links: [
    { key: 'dashboard', label: 'لوحة القيادة', href: 'dashboard.html', roles: [] },
    { section: 'الأعضاء' },
    { key: 'members', label: 'جميع الأعضاء', href: 'members.html', roles: ['super_admin', 'members_manager'] },
    { key: 'requests', label: 'طلبات الانخراط', href: 'requests.html', roles: ['super_admin', 'members_manager'] },
    { section: 'المحتوى' },
    { key: 'activities', label: 'الأنشطة', href: 'activities.html', roles: ['super_admin', 'editor'] },
    { key: 'gallery', label: 'معرض الصور', href: 'gallery.html', roles: ['super_admin', 'editor'] },
    { key: 'board', label: 'أعضاء المكتب', href: 'board.html', roles: ['super_admin', 'editor'] },
    { key: 'announcements', label: 'الإعلانات', href: 'announcements.html', roles: ['super_admin', 'editor'] },
    { key: 'content', label: 'محتوى الموقع', href: 'content.html', roles: ['super_admin', 'editor'] },
    { section: 'الإدارة' },
    { key: 'settings', label: 'الإعدادات العامة', href: 'settings.html', roles: ['super_admin'] },
    { key: 'admins', label: 'المستخدمون الإداريون', href: 'admins.html', roles: ['super_admin'] },
    { key: 'audit', label: 'سجل العمليات', href: 'audit.html', roles: ['super_admin'] }
  ],

  render(profile, activeKey) {
    const allowed = (roles) => !roles || roles.length === 0 || roles.includes(profile.role);

    const navHtml = this.links.map(item => {
      if (item.section) return `<div class="sidebar-section-label">${item.section}</div>`;
      if (!allowed(item.roles)) return '';
      const isActive = item.key === activeKey ? ' active' : '';
      return `<a class="sidebar-link${isActive}" href="${item.href}">${item.label}</a>`;
    }).join('');

    const shellHtml = `
      <div class="mobile-topbar">
        <button id="mobileMenuBtn" aria-label="فتح القائمة">☰</button>
        <span style="font-family:'Amiri',serif; font-weight:700;">لوحة الإدارة</span>
        <span style="width:24px;"></span>
      </div>
      <div class="admin-shell">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-brand">
            <img src="../logo.jpg" alt="شعار الجمعية">
            <span>جمعية المرابطين</span>
          </div>
          <nav class="sidebar-nav">${navHtml}</nav>
          <div class="sidebar-footer">
            <div style="font-size:.8rem; color:rgba(255,255,255,.7); margin-bottom:10px;">
              ${AdminLayout.escapeHtml(profile.full_name)} <br><span style="color:var(--gold-light);">${this.roleLabel(profile.role)}</span>
            </div>
            <button class="sidebar-logout" id="logoutBtn">تسجيل الخروج</button>
          </div>
        </aside>
        <main class="main-content" id="mainContent"></main>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', shellHtml);

    document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
    const menuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
      sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') sidebar.classList.remove('open');
      });
    }

    return document.getElementById('mainContent');
  },

  roleLabel(role) {
    return { super_admin: 'مسؤول أعلى', editor: 'محرر', members_manager: 'مسؤول الأعضاء' }[role] || role;
  },

  escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};
