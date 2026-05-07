'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Target, Plus, Briefcase, User } from 'lucide-react';

interface Goal {
  id: number; employee_name: string; title: string;
  progress: number; status: string; target_date: string;
  project_name: string;
}

interface Project {
  id: number; name: string;
}

interface Employee {
  id: number; first_name: string; last_name: string;
}

function GoalModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ employee_id: '', project_id: '', title: '', description: '', target_date: '' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/employees')])
      .then(([p, e]) => {
        setProjects(p.data.data);
        setEmployees(e.data.data);
        if (e.data.data.length > 0) setForm(prev => ({ ...prev, employee_id: e.data.data[0].id.toString() }));
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/performance/goals', form);
      toast.success('Task created!'); onSaved();
    } catch { toast.error('Failed to create task'); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="text-xl font-bold mb-6">Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Task Title</label>
            <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required placeholder="e.g. Design Login Screen" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Assign To</label>
              <select className="form-input" value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})} required>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
              </select></div>
            <div><label className="form-label">Project (Optional)</label>
              <select className="form-input" value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})}>
                <option value="">No Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></div>
          </div>

          <div><label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} /></div>
          
          <div><label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={form.target_date} onChange={e=>setForm({...form,target_date:e.target.value})} /></div>
          
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Creating...' : 'Assign Task'}</button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await api.get('/performance/goals');
      setGoals(data.data || []);
    } catch {
      toast.error('Failed to load tasks');
    }
  };

  const statusBadge = (s: string) => {
    const m: Record<string,string> = { in_progress: 'badge-pending', completed: 'badge-approved', overdue: 'badge-rejected' };
    return <span className={`badge ${m[s] || 'badge-pending'}`}>{s.replace('_',' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Task Tracking</h1>
        <button className="btn-yellow flex items-center gap-2" onClick={() => setShowGoalModal(true)}>
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-6">All Team Tasks</h3>
        <div className="space-y-4">
          {goals.map(g => (
            <div key={g.id} className="p-5 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={18} className="text-blue-600" />
                    <span className="font-bold text-gray-900">{g.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Briefcase size={14} className="text-gray-400" />
                      <span>{g.project_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <User size={14} className="text-gray-400" />
                      <span>{g.employee_name}</span>
                    </div>
                    <div className="text-xs text-gray-400">Due {g.target_date || 'TBD'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 min-w-[120px]">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-bold text-blue-600">{g.progress}%</span>
                    </div>
                    <div className="progress-bar-bg h-1.5">
                      <div className="progress-bar-fill h-1.5" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                  {statusBadge(g.status)}
                </div>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-center py-8 text-gray-400">No tasks assigned yet.</p>
          )}
        </div>
      </div>

      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} onSaved={() => { setShowGoalModal(false); loadData(); }} />}
    </div>
  );
}
