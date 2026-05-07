'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Edit, Camera, Lock, User } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      if (u.employee_id) {
        api.get(`/employees/${u.employee_id}`).then(res => {
          setEmp(res.data.data);
        }).catch(() => {
          setEmp({ first_name: 'Admin', last_name: 'User', email: u.email, job_title: 'Administrator', department: 'Administration', phone_number: '+2348000000000' });
        });
      } else {
        setEmp({ first_name: 'Admin', last_name: 'User', email: u.email, job_title: 'Administrator', department: 'Administration', phone_number: '+2348000000000' });
      }
    }
    setLoading(false);
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) { toast.error("Passwords don't match"); return; }
    try {
      await api.put('/auth/change-password', {
        current_password: form.current_password, new_password: form.new_password
      });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return <div className="py-12 text-center text-gray-400">Loading...</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-800">My Profile</h1>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-blue-900 font-bold text-2xl">
              {emp?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-900 rounded-full flex items-center justify-center border-2 border-white">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{emp?.first_name} {emp?.last_name}</h2>
            <p className="text-sm text-gray-500">{emp?.job_title || 'Administrator'}</p>
            <p className="text-sm text-gray-500">{emp?.department || 'Administration'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${user?.role === 'admin' ? 'badge-active' : 'badge-approved'}`}>
                {user?.role || 'admin'}
              </span>
              <span className="badge badge-approved">Active</span>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-primary flex items-center gap-2 text-sm">
            <Edit size={14} /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          {[
            { label: 'Email', value: emp?.email || user?.email },
            { label: 'Phone', value: emp?.phone_number || '—' },
            { label: 'Department', value: emp?.department || 'Administration' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-700 text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-2">
        {[{ id: 'profile', icon: User, label: 'Profile Info' }, { id: 'security', icon: Lock, label: 'Security' }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeSection === id ? 'bg-blue-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeSection === 'profile' && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Profile Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['First Name', emp?.first_name], ['Last Name', emp?.last_name],
              ['Email', emp?.email || user?.email], ['Phone', emp?.phone_number],
              ['Job Title', emp?.job_title], ['Department', emp?.department],
              ['City', emp?.city], ['Marital Status', emp?.marital_status],
            ].map(([label, val]) => (
              <div key={label as string}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                {editing ? (
                  <input className="form-input" defaultValue={val || ''} />
                ) : (
                  <p className="font-medium text-gray-700 text-sm">{val || '—'}</p>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditing(false)} className="btn-primary px-5 py-2">Save Changes</button>
              <button onClick={() => setEditing(false)} className="border border-gray-200 rounded-lg px-5 py-2 text-sm hover:bg-gray-50">Cancel</button>
            </div>
          )}
        </div>
      )}

      {activeSection === 'security' && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={form.current_password}
                onChange={e => setForm({ ...form, current_password: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={form.new_password}
                onChange={e => setForm({ ...form, new_password: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={form.confirm_password}
                onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
}
