'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const LEAVE_TYPES = [
  { name: 'Annual Leave', days: 60, color: '#1e3a5f' },
  { name: 'Sick Leave', days: 20, color: '#1e3a5f' },
  { name: 'Maternity Leave', days: 60, color: '#1e3a5f' },
  { name: 'Casual Leave', days: 30, color: '#1e3a5f' },
];

interface Leave {
  id: number; employee_name: string; leave_type: string;
  start_date: string; end_date: string; duration: number;
  status: string; reason: string; department: string;
}

function ApplyModal({ onClose, onSaved, employeeId }: { onClose: () => void; onSaved: () => void; employeeId?: number }) {
  const [form, setForm] = useState({
    employee_id: employeeId ? String(employeeId) : '', leave_type_id: '1', start_date: '', end_date: '',
    duration: '', resumption_date: '', reason: '', relief_officer_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leaves/', { ...form, employee_id: form.employee_id || employeeId });
      toast.success('Leave application submitted!');
      onSaved();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to apply');
      }
    } finally {
      setLoading(false);
    }
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">📚 Leave Application</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Fill the required fields below to apply for leave.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Leave Type</label>
            <select className="form-input" value={form.leave_type_id} onChange={f('leave_type_id')}>
              <option value="1">Annual Leave</option>
              <option value="2">Sick Leave</option>
              <option value="3">Maternity Leave</option>
              <option value="4">Casual Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={form.start_date} onChange={f('start_date')} required />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={form.end_date} onChange={f('end_date')} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Duration (days)</label>
              <input type="number" className="form-input" value={form.duration} onChange={f('duration')} />
            </div>
            <div>
              <label className="form-label">Resumption Date</label>
              <input type="date" className="form-input" value={form.resumption_date} onChange={f('resumption_date')} />
            </div>
          </div>
          <div>
            <label className="form-label">Reason for leave</label>
            <textarea className="form-input" rows={3} value={form.reason} onChange={f('reason')} />
          </div>
          <div>
            <label className="form-label">Attach handover document (pdf, jpg, docx)</label>
            <input type="file" className="form-input py-1" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-green flex-1 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose} className="btn-danger flex-1">Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [activeTab, setActiveTab] = useState('Leave Settings');
  const [showApply, setShowApply] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ employee_id?: number; role?: string } | null>(null);

  const tabList = ['Leave Settings', 'Leave Recall', 'Leave History', 'Relief Officers'];

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
      loadLeaves();
    }
  }, [user]);

  const loadLeaves = async () => {
    try {
      const { data } = await api.get('/leaves/');
      setLeaves(data.data.leaves || []);
    } catch {
      // setLeaves([
      //   { id:1, employee_name:'John Steven Doe', leave_type:'Sick', start_date:'2022-04-22', end_date:'2022-04-28', duration:5, status:'approved', reason:'Personal', department:'Engineering' },
      //   { id:2, employee_name:'Barry Jonah', leave_type:'Exam', start_date:'2022-04-22', end_date:'2022-04-30', duration:7, status:'pending', reason:'Examination', department:'Engineering' },
      //   { id:3, employee_name:'Tiwa Cole', leave_type:'Maternity', start_date:'2022-04-22', end_date:'2022-06-28', duration:120, status:'approved', reason:'Child Care', department:'HR' },
      // ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: string) => {
    try {
      await api.put(`/leaves/${id}/approve`, { status });
      toast.success(`Leave ${status}`);
      loadLeaves();
    } catch {
      toast.error('Action failed');
    }
  };

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected'
    };
    return <span className={`badge ${m[s] || 'badge-pending'}`}>{s}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Leave Type Cards */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-4">📚 Leave Management</h1>

        {/* Blue banner */}
        <div className="rounded-xl p-6 mb-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 100%)' }}>
          <div>
            <h2 className="text-white text-xl font-bold mb-1">Manage ALL <span className="text-yellow-400">Leave Applications</span></h2>
            <p className="text-blue-200 text-sm">A relaxed employee is a performing employee.</p>
          </div>
          {user?.role === 'employee' ? (
            <button className="btn-yellow" onClick={() => setShowApply(true)}>Apply for Leave</button>
          ) : (
            <span className="text-sm text-blue-100">Admin view: review and approve employee leave requests.</span>
          )}
        </div>

        {/* Leave type buttons */}
        <div className="flex gap-3 flex-wrap mb-4">
          {tabList.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab
                ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              style={{ background: activeTab === tab ? '#f5a623' : '#1e3a5f' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Leave Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {LEAVE_TYPES.map(lt => (
            <div key={lt.name} className="rounded-xl p-4 flex items-center gap-3 text-white"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5986)' }}>
              <div className="text-3xl font-black">{lt.days}</div>
              <div>
                <p className="text-sm font-medium text-blue-200">{lt.name}</p>
                {user?.role === 'employee' ? (
                  <button className="btn-yellow px-3 py-1 text-xs mt-1 rounded-lg"
                    onClick={() => setShowApply(true)}>Apply</button>
                ) : (
                  <span className="text-xs text-blue-100">Employee access only</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        {activeTab === 'Leave History' || activeTab === 'Leave Settings' ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">
                {activeTab === 'Leave History' ? 'Leave History' : 'Ongoing Leave Requests'}
              </h3>
              <button className="btn-primary text-sm px-3 py-1.5">Export</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Duration</th><th>Start Date</th><th>End Date</th>
                  <th>Type</th><th>Reason</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td className="font-medium">{l.employee_name}</td>
                    <td>{l.duration}</td>
                    <td>{l.start_date}</td>
                    <td>{l.end_date}</td>
                    <td>{l.leave_type}</td>
                    <td>{l.reason}</td>
                    <td>{statusBadge(l.status)}</td>
                    <td>
                      <div className="flex gap-1">
                        {l.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(l.id, 'approved')}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">Approve</button>
                            <button onClick={() => handleAction(l.id, 'rejected')}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Reject</button>
                          </>
                        )}
                        {l.status === 'approved' && (
                          <button className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Recall</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12 text-gray-400">
            <p>No data for {activeTab}</p>
          </div>
        )}

        {showApply && <ApplyModal employeeId={user?.employee_id} onClose={() => setShowApply(false)} onSaved={() => { setShowApply(false); loadLeaves(); }} />}
      </div>
    </div>
  );
}
