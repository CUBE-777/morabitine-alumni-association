import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Shield, Calendar, Image as ImageIcon,
  Megaphone, FileText, UserCog, History, Settings, Menu, ChevronRight, LogOut,
} from 'lucide-react';
import '../styles/admin.css';
import { ADMIN_NAV } from '../constants/adminNav';
import { useAuth } from '../app/providers/AuthProvider';
import { ROLE_LABELS } from '../services/supabase/auth.service';

const ICONS = {
  'layout-dashboard': LayoutDashboard,
  users: Users,
  'user-plus': UserPlus,
  shield: Shield,
  calendar: Calendar,
  image: ImageIcon,
  megaphone: Megaphone,
  'file-text': FileText,
  'user-cog': UserCog,
  history: History,
  settings: Settings,
};

export default function AdminLayout({ children }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allowed = (roles) => !roles || roles.length === 0 || roles.includes(profile.role);

  return (
    <div className="admin-root" data-theme="admin-dark">
      <div className="admin-mobile-topbar">
        <button aria-label="فتح القائمة" onClick={() => setMobileOpen((v) => !v)}>
          <Menu size={22} />
        </button>
        <span style={{ fontFamily: "'Amiri', serif", fontWeight: 700 }}>لوحة الإدارة</span>
        <span style={{ width: 22 }} />
      </div>

      <div className="admin-shell">
        <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
          <button
            className="admin-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            <ChevronRight size={14} style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
          </button>

          <div className="admin-sidebar-brand">
            <img src="/logo.jpg" alt="شعار الجمعية" />
            <span>جمعية المرابطين</span>
          </div>

          <nav className="admin-sidebar-nav">
            {ADMIN_NAV.map((item, i) => {
              if (item.section) {
                return (
                  <div className="admin-sidebar-section" key={`section-${i}`}>
                    {item.section}
                  </div>
                );
              }
              if (!allowed(item.roles)) return null;
              const Icon = ICONS[item.icon];
              const isActive = location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.key}
                  to={item.href}
                  className={`admin-sidebar-link${isActive ? ' active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="icon">{Icon && <Icon size={17} />}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-user">
              <strong>{profile.full_name}</strong>
              <span className="role">{ROLE_LABELS[profile.role] || profile.role}</span>
            </div>
            <button className="admin-logout-btn" onClick={logout}>
              <LogOut size={14} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
