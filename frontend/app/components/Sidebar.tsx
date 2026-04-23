'use client';

import { usePathname, useRouter } from 'next/navigation';
import { clearUser, getUser } from '../../utils/auth';

const links = [
  { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
  { label: 'Decisions', href: '/decisions', icon: '◈' },
  { label: 'Goals', href: '/goals', icon: '◎' },
  { label: 'Analytics', href: '/analytics', icon: '▲' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    clearUser();
    router.push('/');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">HDGI</div>
        <div className="text-sm font-semibold text-white leading-tight">Decision & Goal Intelligence</div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </a>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-gray-800">
        {/* <p className="text-xs text-gray-500 truncate mb-2">{user?.email}</p> */}
        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-400 hover:text-red-400 text-left transition-colors"
        >
          → Logout
        </button>
      </div>
    </aside>
  );
}