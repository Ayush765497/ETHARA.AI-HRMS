'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check auth only on client
    const token = localStorage.getItem('hrms_token');
    const stored = localStorage.getItem('hrms_user');
    if (!token || !stored) {
      router.replace('/login');
      return;
    }
    const user = JSON.parse(stored);

    // Define allowed routes for each role
    const adminRoutes = [
      '/dashboard', '/employees', '/leaves', '/attendance', '/performance',
      '/payroll', '/documents', '/announcements', '/courses',
      '/recruitment/jobs', '/recruitment/candidates', '/recruitment/resumes'
    ];

    const employeeRoutes = [
      '/dashboard', '/leaves', '/attendance', '/payroll', '/documents', '/announcements'
    ];

    // Check if current path is allowed for user's role
    const allowedRoutes = user.role === 'admin' ? adminRoutes : employeeRoutes;
    const isAllowedRoute = allowedRoutes.some(route =>
      pathname === route || pathname.startsWith(route + '/')
    );

    if (!isAllowedRoute) {
      // Redirect to appropriate dashboard if accessing unauthorized route
      const targetDashboard = user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      router.replace(targetDashboard);
      return;
    }

    setReady(true);
  }, [router, pathname]);


  // Build breadcrumb from pathname
  const crumbs = pathname.split('/').filter(Boolean);

  if (!ready) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: '#0f1b2d' }}
      >
        <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center mb-4 animate-pulse">
          <span className="text-blue-900 font-black text-2xl">N</span>
        </div>
        <p className="text-white text-sm font-medium">Loading Next AI...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Breadcrumb */}
        <div className="px-6 py-2 text-xs text-gray-400 border-b border-gray-200 bg-white flex items-center gap-1">
          <span className="text-blue-700 font-medium">XCELTECH</span>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-gray-300">/</span>
              <span className={`capitalize ${i === crumbs.length - 1 ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                {c.replace(/-/g, ' ')}
              </span>
            </span>
          ))}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
