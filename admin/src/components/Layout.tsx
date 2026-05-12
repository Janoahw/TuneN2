import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Users', path: '/users' },
    { label: 'Moderation', path: '/moderation' },
    { label: 'Content', path: '/content' },
    { label: 'Financials', path: '/financials' },
    { label: 'Settings', path: '/settings' },
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
    <div className="min-h-screen bg-[#0D0D0F] text-white">
      <aside className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r border-[#1A1A1E] bg-[#111114] lg:flex">
        <div className="px-4 py-6">
          <h1 className="font-['Space_Grotesk'] text-lg font-bold text-[#00CCCC]">
            TuneN2 Admin
          </h1>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#1A1A1E] text-[#00CCCC]'
                      : 'text-[#8E8E93] hover:bg-[#1A1A1E]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[#1A1A1E] p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#8E8E93] transition-colors hover:bg-[#1A1A1E] hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#1A1A1E] bg-[#111114] lg:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <span className="text-lg text-white">☰</span>
          <Link to="/" className="font-['Space_Grotesk'] text-base font-bold text-[#00CCCC]">
            TuneN2 Admin
          </Link>
          <button
            onClick={handleLogout}
            className="ml-auto rounded-full bg-[#2A2A2F] px-3 py-1 text-xs text-[#8E8E93]"
          >
            Logout
          </button>
        </div>
        <nav className="flex h-11 gap-1 overflow-x-auto border-t border-[#1A1A1E] px-3 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs transition ${
                isActive(item.path)
                  ? 'bg-[#00CCCC] text-[#0D0D0F]'
                  : 'bg-[#2A2A2F] text-[#8E8E93]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-h-screen lg:ml-60">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
