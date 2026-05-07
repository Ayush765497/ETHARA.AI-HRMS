'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Target, Plus } from 'lucide-react';

interface Goal {
  id: number; employee_name: string; title: string;
  progress: number; status: string; target_date: string;
}

interface Recognition {
  id: number; employee_name: string; message: string; badge: string; created_at: string;
}

function GoalModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ employee_id: '1', title: '', description: '', target_date: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/performance/goals', form);
      toast.success('Goal created!'); onSaved();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="text-lg font-bold mb-4">Create New Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Goal Title</label>
            <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></div>
          <div><label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} /></div>
          <div><label className="form-label">Target Date</label>
            <input type="date" className="form-input" value={form.target_date} onChange={e=>setForm({...form,target_date:e.target.value})} /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Creating...' : 'Create Goal'}</button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Goals');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [goalsRes, recRes] = await Promise.all([
        api.get('/performance/goals'), api.get('/performance/recognitions')
      ]);
      setGoals(goalsRes.data.data || []);
      setRecognitions(recRes.data.data || []);
    } catch {
      setGoals([
        { id:1, employee_name:'John Doe', title:'Increase sales by 20%', progress:60, status:'in_progress', target_date:'2024-06-01' },
        { id:2, employee_name:'Jane Smith', title:'Complete React training', progress:100, status:'completed', target_date:'2024-03-01' },
      ]);
      setRecognitions([
        { id:1, employee_name:'Alice Johnson', message:'Outstanding performance this quarter!', badge:'🏆', created_at:'2024-01-15' },
        { id:2, employee_name:'John Doe', message:'Great teamwork on the project!', badge:'⭐', created_at:'2024-01-10' },
      ]);
    }
  };

  const statusBadge = (s: string) => {
    const m: Record<string,string> = { in_progress: 'badge-pending', completed: 'badge-approved', overdue: 'badge-rejected' };
    return <span className={`badge ${m[s] || 'badge-pending'}`}>{s.replace('_',' ')}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Performance Management</h1>
        <button className="btn-yellow flex items-center gap-2" onClick={() => setShowGoalModal(true)}>
          <Plus size={16} /> Add Goal
        </button>
      </div>

      <div className="flex gap-2 mb-2">
        {['Goals', 'Feedback', 'Recognition'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === t ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Goals' && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">OKR Goals</h3>
          <div className="space-y-4">
            {goals.map(g => (
              <div key={g.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-800">{g.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(g.status)}
                    <span className="text-sm text-gray-500">{g.progress}%</span>
                  </div>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${g.progress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">By {g.employee_name} · Due {g.target_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Recognition' && (
        <div className="space-y-3">
          {recognitions.map(r => (
            <div key={r.id} className="card flex items-start gap-4">
              <div className="text-3xl">{r.badge}</div>
              <div>
                <p className="font-semibold text-gray-800">{r.employee_name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{r.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Feedback' && (
        <div className="card text-center py-12 text-gray-400">Feedback feature coming soon</div>
      )}

      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} onSaved={() => { setShowGoalModal(false); loadData(); }} />}
    </div>
  );
}
