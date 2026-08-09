import React from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            DistribuX Operations Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role} Access</p>
          </div>
        </div>
      </div>
    </header>
  );
};
