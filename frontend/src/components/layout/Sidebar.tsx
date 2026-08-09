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
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform bg-slate-900 text-slate-100 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-slate-800 shadow-xl`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-600 p-2 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">DistribuX</h1>
              <p className="text-xs text-slate-400">Operations Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
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
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-900/50'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
          <div className="border-t border-slate-800 p-4 bg-slate-950/60">
            <div className="flex items-center justify-between mb-3">
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <Badge variant={roleBadgeVariants[user.role] || 'gray'}>
                {user.role}
              </Badge>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-rose-900/40 hover:text-rose-300 transition-colors border border-slate-700"
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
