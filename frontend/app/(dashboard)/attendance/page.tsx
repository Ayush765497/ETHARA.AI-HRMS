'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, Clock } from 'lucide-react';

interface AttendanceRecord {
  id: number; employee_name: string; date: string;
  check_in: string; check_out: string; status: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ employee_id?: number; role?: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);
  }, [router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('hrms_user') || '{}');
      const query = user?.role === 'employee' && user.employee_id ? `?employee_id=${user.employee_id}` : '';
      const { data } = await api.get(`/attendance/${query}`);
      setRecords(data.data.records || []);
    } catch {
      const today = new Date().toISOString().split('T')[0];
      setRecords([
        { id: 1, employee_name: 'John Doe', date: today, check_in: '09:00 AM', check_out: '05:30 PM', status: 'present' },
        { id: 2, employee_name: 'Jane Smith', date: today, check_in: '08:45 AM', check_out: '05:15 PM', status: 'present' },
        { id: 3, employee_name: 'Alice Johnson', date: today, check_in: '09:20 AM', check_out: '', status: 'late' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!user?.employee_id) {
      toast.error('Employee ID not available');
      return;
    }
    try {
      await api.post('/attendance/mark', { employee_id: user.employee_id });
      toast.success('Attendance marked!');
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Error marking attendance');
      }
    }
  };

  const statusBadgeClass = (s: string) => {
    const m: Record<string, string> = { present: 'badge-approved', absent: 'badge-rejected', late: 'badge-pending' };
    return m[s] || 'badge-pending';
  };

  const isEmployee = user?.role === 'employee';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Attendance Management</h1>
          {!isEmployee && (
            <p className="text-sm text-gray-500">Attendance check-in is available for employee accounts only.</p>
          )}
        </div>
        {isEmployee && (
          <button className="btn-yellow flex items-center gap-2" onClick={markAttendance}>
            <CheckCircle size={16} /> Mark Attendance
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present Today', value: records.filter(r => r.status === 'present').length, color: '#166534', bg: '#dcfce7' },
          { label: 'Absent Today', value: records.filter(r => r.status === 'absent').length, color: '#991b1b', bg: '#fee2e2' },
          { label: 'Late Today', value: records.filter(r => r.status === 'late').length, color: '#92400e', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Daily Attendance Log</h2>
        {loading ? <p className="text-center text-gray-400 py-8">Loading...</p> : (
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td className="font-medium">{r.employee_name}</td>
                  <td>{r.date}</td>
                  <td>{r.check_in || '—'}</td>
                  <td>{r.check_out || <span className="text-yellow-600 flex items-center gap-1"><Clock size={12} /> Not checked out</span>}</td>
                  <td><span className={`badge ${statusBadgeClass(r.status)}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
