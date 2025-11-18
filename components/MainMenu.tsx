
import React from 'react';
import type { View, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface MainMenuProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
}

const MenuIcon: React.FC<{ path: string }> = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ml-3">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const menuItems: { view: View; label: string; iconPath: string; roles: Role[] }[] = [
  { view: 'dashboard', label: 'لوحة التحكم والإحصائيات', iconPath: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m1-1.5l1 1.5m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.5-1.5l-1-1.5m1 1.5h7.5', roles: ['admin', 'manager'] },
  { view: 'students', label: 'إدارة الطلاب والتسجيلات', iconPath: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z', roles: ['admin', 'manager'] },
  { view: 'delegates', label: 'إدارة المستخدمين والموظفين', iconPath: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.228a4.5 4.5 0 00-1.025.07M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin'] },
  { view: 'commissions', label: 'سجل العمولات والمدفوعات', iconPath: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414-.336.75-.75.75h-.75m0-1.5h.375c.621 0 1.125.504 1.125 1.125v.375m-18 0h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v9h18c.621 0 1.125-.504 1.125-1.125v-9.125c0-.621-.504-1.125-1.125-1.125H3.75z', roles: ['admin', 'manager'] },
  { view: 'courses', label: 'إدارة الدورات', iconPath: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', roles: ['admin', 'manager'] },
  { view: 'reports', label: 'التقارير والإحصائيات', iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 19.875v-6.75zM3.75 14.25v4.5a.75.75 0 00.75.75h15a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75z', roles: ['admin', 'manager'] },
  { view: 'activity-logs', label: 'سجل النشاطات', iconPath: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z', roles: ['admin'] },
  { view: 'settings', label: 'إعدادات النظام', iconPath: 'M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.197-.22 1.752 0 .549.219 1.018.684 1.11 1.226l.082.498a1.5 1.5 0 001.458 1.075h.502a1.5 1.5 0 011.5 1.5v.502c0 .608-.287 1.17-.757 1.458l-.498.082c-.542.09-.92.56-1.226 1.11-.22.554-.22 1.197 0 1.752.219.549.684 1.018 1.226 1.11l.498.082a1.5 1.5 0 01.757 1.458v.502a1.5 1.5 0 01-1.5 1.5h-.502a1.5 1.5 0 00-1.458 1.075l-.082.498c-.09.542-.56 1.007-1.11 1.226-.554.22-1.197-.22-1.752 0-.549-.219-1.018-.684-1.11-1.226l-.082-.498a1.5 1.5 0 00-1.458-1.075h-.502a1.5 1.5 0 01-1.5-1.5v-.502c0-.608.287-1.17.757-1.458l.498-.082c.542-.09.92.56 1.226-1.11.22-.554-.22-1.197 0-1.752-.219-.549-.684-1.018-1.226-1.11l-.498-.082a1.5 1.5 0 01-.757-1.458v-.502a1.5 1.5 0 011.5-1.5h.502A1.5 1.5 0 009.594 3.94zM14.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', roles: ['admin'] },
  { view: 'logout', label: 'تسجيل الخروج', iconPath: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75', roles: ['admin', 'manager', 'delegate'] },
];

export const MainMenu: React.FC<MainMenuProps> = ({ activeView, setActiveView, isOpen }) => {
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) return null;

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className={`bg-[var(--color-primary)] text-[var(--color-primary-text)] w-64 p-4 min-h-screen fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out md:static md:transform-none md:min-h-screen no-print
      ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold pt-8">القائمة الرئيسية</h2>
        <p className="text-sm opacity-80">{currentUser.fullName}</p>
      </div>
      <nav>
        <ul>
          {visibleMenuItems.map(({ view, label, iconPath }) => (
            <li key={view} className="mb-2">
              <button
                onClick={() => (view === 'logout' ? logout() : setActiveView(view))}
                className={`w-full flex items-center text-right p-3 rounded-lg transition-colors duration-200 ${
                  activeView === view
                    ? 'bg-[var(--color-secondary)]'
                    : 'hover:bg-[var(--color-primary-hover)]'
                }`}
              >
                <MenuIcon path={iconPath} />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
