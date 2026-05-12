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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#111114] border-r border-[#1A1A1E] flex flex-col">
        <div className="p-6 border-b border-[#1A1A1E]">
          <h1 className="text-2xl font-bold text-[#00CCCC]">TuneN2 Admin</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-[#00CCCC] text-white'
                      : 'text-[#8E8E93] hover:bg-[#1A1A1E]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#1A1A1E]">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-[#8E8E93] hover:bg-[#1A1A1E] rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
