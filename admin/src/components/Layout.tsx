import type { LucideIcon } from 'lucide-react';
import {
  CircleDollarSign,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: Array<{ label: string; path: string; icon: LucideIcon }> = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Moderation', path: '/moderation', icon: ShieldAlert },
    { label: 'Content', path: '/content', icon: Library },
    { label: 'Financials', path: '/financials', icon: CircleDollarSign },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface text-white">
      <aside className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r border-[#1A1A1E] bg-surface-alt lg:flex">
        <div className="px-6 pb-6 pt-5">
          <h1 className="font-['Space_Grotesk'] text-[18px] font-bold tracking-[-0.03em] text-[#00CCCC]">
            TuneN2 Admin
          </h1>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2.5 rounded-lg px-4 py-3 text-[13px] font-medium leading-none transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#1A1A1E] text-[#00CCCC]'
                      : 'text-[#8E8E93] hover:bg-[#1A1A1E] hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.85} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[#1A1A1E] p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-4 py-3 text-left text-[13px] font-medium text-[#8E8E93] transition-colors hover:bg-[#1A1A1E] hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.85} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#1A1A1E] bg-surface-alt lg:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Menu className="h-5 w-5 text-white" strokeWidth={1.9} />
          <Link to="/" className="font-['Space_Grotesk'] text-[16px] font-bold text-[#00CCCC]">
            TuneN2 Admin
          </Link>
          <button
            onClick={handleLogout}
            className="ml-auto rounded-full bg-surface-elevated px-3 py-1 text-xs text-[#8E8E93]"
          >
            Logout
          </button>
        </div>
        <nav className="flex h-11 gap-1 overflow-x-auto border-t border-[#1A1A1E] px-3 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition ${
                isActive(item.path)
                  ? 'bg-[#00CCCC] text-surface'
                  : 'bg-surface-elevated text-[#8E8E93]'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" strokeWidth={1.85} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-h-screen lg:ml-60">
        <div className="p-4 sm:p-6 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
