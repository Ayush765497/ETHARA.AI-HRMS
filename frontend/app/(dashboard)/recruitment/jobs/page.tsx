'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Briefcase, Users, Plus, X } from 'lucide-react';

interface Job { id: number; title: string; department: string; job_type: string; status: string; created_at: string; }
interface Candidate { id: number; full_name: string; email: string; job_title: string; status: string; created_at: string; resume_url?: string; }

function JobModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', requirements: '', job_type: 'Full time', location: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/recruitment/jobs', form);
      toast.success('Job posted!'); onSaved();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">Post New Job</h2><button onClick={onClose}><X size={18} className="text-gray-400" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="form-label">Job Title</label><input className="form-input" value={form.title} onChange={f('title')} required /></div>
          <div><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={f('description')} /></div>
          <div><label className="form-label">Requirements</label><textarea className="form-input" rows={2} value={form.requirements} onChange={f('requirements')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Type</label>
              <select className="form-input" value={form.job_type} onChange={f('job_type')}>
                <option>Full time</option><option>Part time</option><option>Contract</option>
              </select>
            </div>
            <div><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={f('location')} /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Posting...' : 'Post Job'}</button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CandidateModal({ onClose, onSaved, jobs }: { onClose: () => void; onSaved: () => void; jobs: Job[] }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', job_id: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/recruitment/candidates', form);
      toast.success('Candidate added!'); onSaved();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">Add Candidate</h2><button onClick={onClose}><X size={18} className="text-gray-400" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">First Name</label><input className="form-input" value={form.first_name} onChange={f('first_name')} required /></div>
            <div><label className="form-label">Last Name</label><input className="form-input" value={form.last_name} onChange={f('last_name')} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={f('email')} /></div>
            <div><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={f('phone')} /></div>
          </div>
          <div><label className="form-label">Job Position</label>
            <select className="form-input" value={form.job_id} onChange={f('job_id')}>
              <option value="">Select job</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div><label className="form-label">Notes</label><textarea className="form-input" rows={2} value={form.notes} onChange={f('notes')} /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Adding...' : 'Add Candidate'}</button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState<'Jobs' | 'Candidates'>('Jobs');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandModal, setShowCandModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobRes, candRes] = await Promise.all([
        api.get('/recruitment/jobs'), api.get('/recruitment/candidates')
      ]);
      setJobs(jobRes.data.data || []);
      setCandidates(candRes.data.data || []);
    } catch {
      setJobs([
        { id:1, title:'Senior Frontend Developer', department:'Engineering', job_type:'Full time', status:'open', created_at:'2024-01-15' },
        { id:2, title:'HR Specialist', department:'Human Resources', job_type:'Full time', status:'open', created_at:'2024-01-10' },
        { id:3, title:'UI/UX Designer', department:'Design', job_type:'Contract', status:'closed', created_at:'2024-01-05' },
      ]);
      setCandidates([
        { id:1, full_name:'James Adebayo', email:'james@email.com', job_title:'Senior Frontend Developer', status:'shortlisted', created_at:'2024-01-20' },
        { id:2, full_name:'Sarah Okafor', email:'sarah@email.com', job_title:'HR Specialist', status:'applied', created_at:'2024-01-18' },
        { id:3, full_name:'Michael Chen', email:'michael@email.com', job_title:'UI/UX Designer', status:'interviewed', created_at:'2024-01-12' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/recruitment/candidates/${id}`, { status });
      toast.success('Status updated');
      loadData();
    } catch { toast.error('Failed'); }
  };

  const statusColors: Record<string, string> = {
    applied: 'badge-pending', shortlisted: 'badge-active', interviewed: 'badge-active',
    hired: 'badge-approved', rejected: 'badge-rejected'
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Recruitment</h1>
        <button className="btn-yellow flex items-center gap-2"
          onClick={() => activeTab === 'Jobs' ? setShowJobModal(true) : setShowCandModal(true)}>
          <Plus size={16} /> Add {activeTab === 'Jobs' ? 'Job' : 'Candidate'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-2xl font-bold text-blue-900">{jobs.length}</p><p className="text-xs text-gray-500">Open Positions</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-green-600">{candidates.filter(c=>c.status==='hired').length}</p><p className="text-xs text-gray-500">Hired</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-yellow-600">{candidates.filter(c=>c.status==='shortlisted').length}</p><p className="text-xs text-gray-500">Shortlisted</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-gray-600">{candidates.length}</p><p className="text-xs text-gray-500">Total Candidates</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['Jobs', 'Candidates'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === t ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {t === 'Jobs' ? <Briefcase size={15} /> : <Users size={15} />} {t}
          </button>
        ))}
      </div>

      {activeTab === 'Jobs' && (
        <div className="card">
          <table>
            <thead><tr><th>Job Title</th><th>Department</th><th>Type</th><th>Status</th><th>Posted</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td className="font-medium text-blue-900">{j.title}</td>
                  <td>{j.department}</td>
                  <td><span className="badge badge-active">{j.job_type}</span></td>
                  <td><span className={`badge ${j.status === 'open' ? 'badge-approved' : 'badge-rejected'}`}>{j.status}</span></td>
                  <td className="text-gray-400 text-sm">{j.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Candidates' && (
        <div className="card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Position</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {candidates.map(c => (
                <tr key={c.id}>
                  <td className="font-medium">{c.full_name}</td>
                  <td className="text-gray-500">{c.email}</td>
                  <td>{c.job_title}</td>
                  <td><span className={`badge ${statusColors[c.status] || 'badge-pending'}`}>{c.status}</span></td>
                  <td>
                    <select className="text-xs border border-gray-200 rounded px-2 py-1"
                      value={c.status}
                      onChange={e => updateCandidateStatus(c.id, e.target.value)}>
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showJobModal && <JobModal onClose={() => setShowJobModal(false)} onSaved={() => { setShowJobModal(false); loadData(); }} />}
      {showCandModal && <CandidateModal jobs={jobs} onClose={() => setShowCandModal(false)} onSaved={() => { setShowCandModal(false); loadData(); }} />}
    </div>
  );
}
