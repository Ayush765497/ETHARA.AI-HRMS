'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Megaphone, Plus } from 'lucide-react';

interface Announcement { id: number; title: string; content: string; is_pinned: boolean; created_at: string; }
interface Survey { id: number; title: string; description: string; is_active: boolean; }
interface User { email?: string; role?: string; employee_id?: number; }

function CreateAnnouncementModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/announcements/', {
        title: form.title.trim(),
        content: form.content.trim(),
        is_pinned: form.is_pinned,
      });
      toast.success('Announcement created');
      onSaved();
    } catch {
      toast.error('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold">Create Announcement</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="form-label">Message</label>
            <textarea
              className="form-input"
              rows={4}
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
            />
            Pin this announcement
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Publishing...' : 'Publish'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EngagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeTab, setActiveTab] = useState<'Announcements' | 'Surveys'>('Announcements');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const loadData = async () => {
    try {
      const [annRes, survRes] = await Promise.all([api.get('/announcements/'), api.get('/announcements/surveys')]);
      setAnnouncements(annRes.data.data || []);
      setSurveys(survRes.data.data || []);
    } catch {
      setAnnouncements([
        { id: 1, title: 'Welcome! New team members joined', content: 'Welcome new staff! Please extend support.', is_pinned: true, created_at: '2024-01-15' },
        { id: 2, title: 'Project Sync Meeting', content: 'Daily sync at 10 AM in Room 5.', is_pinned: false, created_at: '2024-01-14' },
      ]);
      setSurveys([
        { id: 1, title: 'Work Culture Survey', description: 'Help us improve with your feedback.', is_active: true },
        { id: 2, title: 'Office Space Preferences', description: 'Tell us your ideal working setup.', is_active: false },
      ]);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    loadData();
  }, []);

  const isAdmin = user?.role === 'admin';

  const deleteAnn = async (id: number) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      loadData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const respondSurvey = async (survey: Survey) => {
    if (!survey.is_active) {
      toast.error('Survey is closed');
      return;
    }

    const answer = window.prompt('Enter your response');
    if (!answer) return;

    try {
      const user = JSON.parse(localStorage.getItem('hrms_user') || '{}');
      await api.post(`/announcements/surveys/${survey.id}/respond`, {
        employee_id: user.employee_id || 0,
        answers: { feedback: answer },
      });
      toast.success('Response submitted');
    } catch {
      toast.error('Failed to submit response');
    }
  };

  const startNewAnnouncement = () => setShowCreateModal(true);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Announcements & Surveys</h1>
          <p className="text-sm text-gray-500">Stay updated with company news and share feedback.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button className="btn-yellow flex items-center gap-2" onClick={startNewAnnouncement}>
              <Plus size={16} /> Create Announcement
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {(['Announcements', 'Surveys'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Announcements' && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ann.is_pinned ? '#fef3c7' : '#eff6ff' }}>
                    <Megaphone size={17} style={{ color: ann.is_pinned ? '#f5a623' : '#1e3a5f' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                      {ann.is_pinned && <span className="badge badge-pending text-xs">Pinned</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(ann.created_at).toLocaleDateString()}</p>
                    {expanded === ann.id && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{ann.content}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setExpanded(expanded === ann.id ? null : ann.id)} className="text-xs text-blue-600 hover:underline">
                    {expanded === ann.id ? 'Hide' : 'View'}
                  </button>
                  {isAdmin && (
                    <button onClick={() => deleteAnn(ann.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Surveys' && (
        <div className="space-y-3">
          {surveys.map((s) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${s.is_active ? 'badge-approved' : 'badge-rejected'}`}>{s.is_active ? 'Active' : 'Closed'}</span>
                <button onClick={() => respondSurvey(s)} className="btn-yellow text-sm px-3 py-1.5">Respond</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAnnouncementModal onClose={() => setShowCreateModal(false)} onSaved={() => { setShowCreateModal(false); loadData(); }} />
      )}
    </div>
  );
}
