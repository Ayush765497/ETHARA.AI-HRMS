'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Briefcase, Users, FileText,
  UserCheck, BookOpen, BarChart2, DollarSign, Megaphone,
  GraduationCap, LogOut, ChevronDown, Bell
} from 'lucide-react';

type NavItem = {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: string | number;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const adminNavSections: NavSection[] = [
  {
    label: 'Features',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      // { href: '/messages', icon: MessageSquare, label: 'Messages', badge: 3 },
    ]
  },
  {
    label: 'Recruitment',
    items: [
      { href: '/recruitment/jobs', icon: Briefcase, label: 'Jobs' },
      { href: '/recruitment/candidates', icon: Users, label: 'Candidates' },
      { href: '/recruitment/resumes', icon: FileText, label: 'Resumes' },
    ]
  },
  {
    label: 'Organization',
    items: [
      { href: '/employees', icon: UserCheck, label: 'Employee Management' },
      { href: '/leaves', icon: BookOpen, label: 'Leave Management' },
      { href: '/attendance', icon: BarChart2, label: 'Attendance' },
      { href: '/performance', icon: BarChart2, label: 'Performance Management' },
      { href: '/payroll', icon: DollarSign, label: 'Payroll Management' },
      { href: '/documents', icon: FileText, label: 'Document Management' },
      { href: '/announcements', icon: Megaphone, label: 'Engagement System' },
      { href: '/courses', icon: GraduationCap, label: 'LMS' },
    ]
  }
];

const employeeNavSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { href: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      // { href: '/messages', icon: MessageSquare, label: 'Messages' },
    ]
  },
  {
    label: 'Self Service',
    items: [
      { href: '/leaves', icon: BookOpen, label: 'Leave Requests' },
      { href: '/attendance', icon: BarChart2, label: 'Attendance' },
      { href: '/payroll', icon: DollarSign, label: 'Payslip' },
      { href: '/documents', icon: FileText, label: 'Documents' },
      { href: '/announcements', icon: Megaphone, label: 'Engagement' },
    ]
  }
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-blue-900 font-black text-sm">N</span>
          </div>
          <span className="font-bold text-white text-lg tracking-wide">Next AI</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{user?.email?.split('@')[0] || 'Admin'}</p>
            <p className="text-xs capitalize" style={{ color: '#a8b4c8' }}>{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {(user?.role === 'employee' ? employeeNavSections : adminNavSections).map((section) => (
          <div key={section.label} className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest px-2 mb-2" style={{ color: '#4a5568' }}>
              {section.label}
            </p>
            {section.items.map(({ href, icon: Icon, label, badge }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href}
                  className={`sidebar-item ${active ? 'sidebar-active' : ''}`}>
                  <Icon size={17} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
