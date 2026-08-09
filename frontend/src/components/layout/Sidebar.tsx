import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      name: 'Customers CRM',
      path: '/customers',
      icon: Users,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
    },
    {
      name: 'Products Catalog',
      path: '/products',
      icon: Package,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      name: 'Stock Movements',
      path: '/inventory',
      icon: Boxes,
      roles: ['ADMIN', 'WAREHOUSE'],
    },
    {
      name: 'Sales Challans',
      path: '/challans',
      icon: FileSpreadsheet,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
  ];

  const roleBadgeVariants: Record<string, any> = {
    ADMIN: 'purple',
    SALES: 'success',
    WAREHOUSE: 'warning',
    ACCOUNTS: 'info',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform bg-zinc-950 text-zinc-100 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-zinc-800 shadow-2xl`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl bg-black border border-cyan-500/30 p-0.5 shadow-md shadow-cyan-500/20">
              <img src="/logo.png" alt="DistribuX Logo" className="h-full w-full object-cover rounded-lg" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">DistribuX</h1>
              <p className="text-[10px] uppercase font-semibold text-cyan-400 tracking-wider">Operations Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isVisible = hasRole(...(item.roles as any));
            if (!isVisible) return null;

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 border border-cyan-400/40'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile & Role Badge */}
        {user && (
          <div className="border-t border-zinc-800/80 p-4 bg-zinc-950/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="truncate pr-2">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider rounded-md uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-500/40 transition-all border border-zinc-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
