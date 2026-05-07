'use client';
import { useState, useEffect } from 'react';
import { Bell, Settings, Mail, Search, Menu, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<{email: string; role: string} | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <header className="topbar sticky top-0 z-30">
      <button className="text-gray-500 hover:text-gray-700 lg:hidden" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      {/* Filter + Search */}
      <div className="flex items-center gap-2 flex-1 max-w-lg">
        <button className="flex items-center gap-2 bg-blue-900 text-white px-3 py-2 rounded-lg text-sm font-medium">
          All Candidates <ChevronDown size={14} />
        </button>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Icons */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
          <Bell size={17} />
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">3</span>
        </button>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition">
          <Settings size={17} />
        </button>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition">
          <Mail size={17} />
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">1</span>
        </button>
        <Link href="/profile">
          <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:ring-2 hover:ring-orange-300 transition">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </Link>
      </div>
    </header>
  );
}
