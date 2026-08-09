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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:block">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            DistribuX Operations Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 font-bold border border-cyan-500/30">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-zinc-100 leading-tight">{user?.name}</p>
            <p className="text-xs text-zinc-500">{user?.role} Access</p>
          </div>
        </div>
      </div>
    </header>
  );
};
