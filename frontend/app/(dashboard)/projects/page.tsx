'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Briefcase, Plus, Trash2, Calendar } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  task_count: number;
  end_date: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', end_date: '' });

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', end_date: '' });
      loadProjects();
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      loadProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Project Management</h1>
        <button className="btn-yellow flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.id} className="card group relative">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <Briefcase size={24} />
              </div>
              <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition">
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{p.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.description || 'No description provided.'}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={14} />
                <span>Due {p.end_date || 'TBD'}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {p.status}
              </span>
            </div>
            <div className="mt-3 text-xs text-blue-600 font-semibold">
              {p.task_count} Tasks assigned
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Loading projects...</div>}
      {!loading && projects.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-gray-300" />
          </div>
          <h3 className="text-gray-800 font-semibold">No projects yet</h3>
          <p className="text-gray-500 text-sm mt-1">Start by creating your first team project.</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="text-xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label">Project Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Website Redesign" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Project goals and scope..." />
              </div>
              <div>
                <label className="form-label">Target End Date</label>
                <input type="date" className="form-input" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Create Project</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
