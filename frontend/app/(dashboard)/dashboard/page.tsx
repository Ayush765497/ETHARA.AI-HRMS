'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Users, BookOpen, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

interface Stats {
  total_employees: number;
  pending_leaves: number;
  approved_leaves: number;
  today_attendance: number;
  attendance_rate: number;
  recent_announcements: Array<{ id: number; title: string; content: string }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch {
      // Fallback mock data if backend not running
      setStats({
        total_employees: 124, pending_leaves: 8, approved_leaves: 23,
        today_attendance: 98, attendance_rate: 79.0,
        recent_announcements: [
          { id: 1, title: 'Welcome! New staff joining us', content: 'We have a new staff joining us' },
          { id: 2, title: 'Staff meeting - Project Manager', content: 'Kindly gather at the meeting hall' },
          { id: 3, title: 'Marriage Alert', content: 'Congratulations to John Doe!' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  const statCards = isEmployee ? [
    { label: 'Available Leaves', value: 15, icon: BookOpen, color: '#1e3a5f', bg: '#dbeafe' },
    { label: 'Today Attendance', value: stats?.today_attendance ?? 0, icon: CheckCircle, color: '#166534', bg: '#dcfce7' },
    { label: 'Attendance Rate', value: `${stats?.attendance_rate ?? 0}%`, icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe' },
  ] : [
    { label: 'Total Employees', value: stats?.total_employees ?? 0, icon: Users, color: '#1e3a5f', bg: '#dbeafe' },
    { label: 'Pending Leaves', value: stats?.pending_leaves ?? 0, icon: Clock, color: '#92400e', bg: '#fef3c7' },
    { label: 'Today Attendance', value: stats?.today_attendance ?? 0, icon: CheckCircle, color: '#166534', bg: '#dcfce7' },
    { label: 'Attendance Rate', value: `${stats?.attendance_rate ?? 0}%`, icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe' },
  ];

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Attendance',
      data: [88, 92, 85, 95, 90, 87],
      backgroundColor: '#1e3a5f',
      borderRadius: 6,
    }]
  };

  const doughnutData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [79, 13, 8],
      backgroundColor: ['#1e3a5f', '#f5a623', '#ef4444'],
      borderWidth: 0,
    }]
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="rounded-xl p-6 text-white flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold text-xl">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.email?.split('@')[0] || 'Admin'}</h2>
            <p className="text-blue-200 text-sm capitalize">{user?.role || 'Administrator'}</p>
          </div>
        </div>
        <button className="btn-yellow px-5 py-2 font-semibold rounded-lg">Edit Profile</button>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {isEmployee ? ['Apply For Leave', 'View Payslip', 'Update Profile', 'Events'] : ['Manage Employees', 'Approve Leaves', 'Review Attendance', 'Configure Policies', 'Generate Reports'].map(a => (
            <button key={a} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color }}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts + Announcements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-4">Monthly Attendance</h3>
          <Bar data={barData} options={{
            responsive: true, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
          }} height={120} />
        </div>

        {/* Doughnut */}
        <div className="card flex flex-col items-center justify-center">
          <h3 className="font-semibold text-gray-700 mb-3 self-start">Attendance Breakdown</h3>
          <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      {/* Announcements + Leave balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Recent Announcements</h3>
          <div className="space-y-2">
            {stats?.recent_announcements?.map(ann => (
              <div key={ann.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{ann.title}</p>
                <button className="text-gray-400 hover:text-gray-600 ml-2">▼</button>
              </div>
            ))}
            {(!stats?.recent_announcements || stats.recent_announcements.length === 0) && (
              <p className="text-sm text-gray-400">No announcements</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Available Leave Days</h3>
          <div className="space-y-3">
            {[
              { type: 'Annual Leave', used: 10, total: 60 },
              { type: 'Sick Leave', used: 0, total: 10 },
              { type: 'Compassionate Leave', used: 8, total: 15 },
            ].map(({ type, used, total }) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{type}</span>
                  <span className="text-gray-400 text-xs">{used} of {total} days</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(used / total) * 100}%`, background: used > total * 0.8 ? '#ef4444' : '#f5a623' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
